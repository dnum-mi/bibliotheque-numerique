import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { Champ, Message, PieceJustificativeChamp, RepetitionChamp } from '@dnum-mi/ds-api-client'
import { eFileDsSourceLabel, eState } from '@biblio-num/shared'

import { Dossier } from '../objects/entities/dossier.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LeanDossierOutputDto } from '@/modules/dossiers/objects/dto/lean-dossier-output.dto'
import { File } from '../../files/objects/entities/file.entity'

@Injectable()
export class DossierService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async getOrganismeDossiers(
    organismeId: number,
  ): Promise<LeanDossierOutputDto[]> {
    if (isNaN(organismeId)) {
      throw new BadRequestException('Invalid organisme id.')
    }
    this.logger.verbose(`getOrganismeDossiers ${organismeId}`)
    return this.repo
      .createQueryBuilder('d')
      .innerJoinAndSelect(
        'd.demarche',
        'demarche',
        'demarche.id = d.demarcheId',
      )
      .innerJoin('d.organisme', 'organisme', 'organisme.id = d.organismeId')
      .where('organisme.id = :organismeId', { organismeId })
      .select(['d', 'demarche.title', 'demarche.id'])
      .getMany()
      .then(dossiers => {
        return dossiers.map(dossier => ({
          id: dossier.id,
          demarcheId: dossier.demarche.id,
          demarcheTitle: dossier.demarche.title,
          prefecture: dossier.prefecture,
          state: dossier.state,
          dateDepot: dossier.dateDepot,
        }))
      })
  }

  async softDeleteDemarcheDossiers(demarcheId: number): Promise<void> {
    this.logger.verbose(`softDeleteDemarcheDossiers ${demarcheId}`)
    await this.repo.softDelete({ demarcheId })
  }

  transformValueFileOfDossier(dossier: Dossier, files: File[]): Dossier {
    this.logger.verbose('transformValueFileOfDossier')
    if (dossier.dsDataJson.champs && Array.isArray(dossier.dsDataJson.champs)) {
      dossier.dsDataJson.champs.forEach(
        this.transformUrlToUuid(files.filter((f) => f.sourceLabel === eFileDsSourceLabel['ds-champ'])),
      )
    }
    if (dossier.dsDataJson.annotations && Array.isArray(dossier.dsDataJson.annotations)) {
      dossier.dsDataJson.annotations.forEach(
        this.transformUrlToUuid(files.filter((f) => f.sourceLabel === eFileDsSourceLabel['ds-annotation'])),
      )
    }
    if (dossier.dsDataJson.messages && Array.isArray(dossier.dsDataJson.messages)) {
      dossier.dsDataJson.messages.forEach(
        this.transformUrlToUuidMessage(files.filter((f) => f.sourceLabel === eFileDsSourceLabel['ds-message'])),
      )
    }

    if (dossier.dsDataJson.attestation) {
      dossier.dsDataJson.attestation.url = files.find(f => f.sourceLabel === eFileDsSourceLabel['ds-attestation'])?.uuid
    }
    return dossier
  }

  private setFileUrlToUuid = (id, files, fileCh, filesCh):void => {
    if (fileCh) {
      const fileFound = files.find(file => file.sourceStringId === id && file.checksum === fileCh.checksum)
      fileCh.url = fileFound?.uuid ?? ''
      fileCh.state = fileFound?.state ?? eState.queued
    }
    if (filesCh) {
      filesCh.forEach((fileCh1) => {
        const fileFound = files.find(file => file.sourceStringId === id && file.checksum === fileCh1.checksum)
        fileCh1.url = fileFound?.uuid ?? ''
        fileCh1.state = fileFound?.state ?? eState.queued
      })
    }
  }

  private transformUrlToUuid(files: File[]) {
    return (ch: Champ):void => {
      if (ch.__typename === 'PieceJustificativeChamp') {
        const fileCh = (ch as PieceJustificativeChamp).file
        const filesCh = (ch as PieceJustificativeChamp).files
        this.setFileUrlToUuid(ch.id, files, fileCh, filesCh)
      }
      if (ch.__typename === 'RepetitionChamp') {
        if ((ch as RepetitionChamp).champs) {
          (ch as RepetitionChamp).champs.forEach(this.transformUrlToUuid(files))
        }
        if ((ch as RepetitionChamp).rows) {
          (ch as RepetitionChamp).rows.forEach(row => row.champs.forEach(this.transformUrlToUuid(files)))
        }
      }
    }
  }

  private transformUrlToUuidMessage(files: File[]) {
    return (m: Message):void => {
      const fileCh = m.attachment
      const filesCh = m.attachments
      this.setFileUrlToUuid(m.id, files, fileCh, filesCh)
    }
  }
}
