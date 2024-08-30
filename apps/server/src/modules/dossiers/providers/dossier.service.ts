import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import {
  Champ,
  Message,
  PieceJustificativeChamp,
  RepetitionChamp,
} from '@dnum-mi/ds-api-client'
import {
  eFileDsSourceLabel,
  eState,
  anomymisedStringValue,
  anomymisedFileValue,
  anomymisedFileUuid,
} from '@biblio-num/shared'

import { Dossier } from '../objects/entities/dossier.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LeanDossierOutputDto } from '@/modules/dossiers/objects/dto/lean-dossier-output.dto'
import { File } from '../../files/objects/entities/file.entity'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import {
  fixFieldValueFunctionsDemandeur,
} from '@/modules/dossiers/objects/constante/fix-field-demandeur.dictionnary'
import { MappingAnonymized } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'

@Injectable()
export class DossierService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    private readonly fieldService: FieldService,
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
      .then((dossiers) => {
        return dossiers.map((dossier) => ({
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
        this.transformUrlToUuid(
          files.filter((f) => f.sourceLabel === eFileDsSourceLabel['ds-champ']),
        ),
      )
    }
    if (
      dossier.dsDataJson.annotations &&
      Array.isArray(dossier.dsDataJson.annotations)
    ) {
      dossier.dsDataJson.annotations.forEach(
        this.transformUrlToUuid(
          files.filter(
            (f) => f.sourceLabel === eFileDsSourceLabel['ds-annotation'],
          ),
        ),
      )
    }
    if (
      dossier.dsDataJson.messages &&
      Array.isArray(dossier.dsDataJson.messages)
    ) {
      dossier.dsDataJson.messages.forEach(
        this.transformUrlToUuidMessage(
          files.filter(
            (f) => f.sourceLabel === eFileDsSourceLabel['ds-message'],
          ),
        ),
      )
    }

    if (dossier.dsDataJson.attestation) {
      dossier.dsDataJson.attestation.url = files.find(
        (f) => f.sourceLabel === eFileDsSourceLabel['ds-attestation'],
      )?.uuid
    }
    return dossier
  }

  private setFileUrlToUuid = (id, files, fileCh, filesCh): void => {
    if (fileCh) {
      const fileFound = files.find(
        (file) =>
          file.sourceStringId === id && file.checksum === fileCh.checksum,
      )
      fileCh.url = fileFound?.uuid ?? ''
      fileCh.state = fileFound?.state ?? eState.queued
    }
    if (filesCh) {
      filesCh.forEach((fileCh1) => {
        const fileFound = files.find(
          (file) =>
            file.sourceStringId === id && file.checksum === fileCh1.checksum,
        )
        fileCh1.url = fileFound?.uuid ?? ''
        fileCh1.state = fileFound?.state ?? eState.queued
      })
    }
  }

  private transformUrlToUuid(files: File[]) {
    return (ch: Champ): void => {
      if (ch.__typename === 'PieceJustificativeChamp') {
        const fileCh = (ch as PieceJustificativeChamp).file
        const filesCh = (ch as PieceJustificativeChamp).files
        this.setFileUrlToUuid(ch.id, files, fileCh, filesCh)
      }
      if (ch.__typename === 'RepetitionChamp') {
        if ((ch as RepetitionChamp).champs) {
          ;(ch as RepetitionChamp).champs.forEach(
            this.transformUrlToUuid(files),
          )
        }
        if ((ch as RepetitionChamp).rows) {
          ;(ch as RepetitionChamp).rows.forEach((row) =>
            row.champs.forEach(this.transformUrlToUuid(files)),
          )
        }
      }
    }
  }

  private transformUrlToUuidMessage(files: File[]) {
    return (m: Message): void => {
      const fileCh = m.attachment
      const filesCh = m.attachments
      this.setFileUrlToUuid(m.id, files, fileCh, filesCh)
    }
  }

  async anonymiseDossier(
    dossier: Dossier,
    mappingAnonymized: MappingAnonymized[],
  ): Promise<void> {
    this.logger.verbose(`anonymiseDossier ${dossier.id}`)

    await this.anonymiseDemandeur(dossier)

    if (mappingAnonymized.length !== 0) {
      await this.anonymiseChampsAndAnnotations(dossier, mappingAnonymized)
    }
  }

  private async anonymiseDemandeur(dossier: Dossier): Promise<void> {
    this.logger.verbose(`anonymiseDemandeur ${dossier.id}`)
    const demandeurKeys = ['nom', 'prenom', 'civilite']

    // Anonymise demandeur in dsDataJson
    demandeurKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(dossier.dsDataJson.demandeur, key)) {
        dossier.dsDataJson.demandeur[key] = anomymisedStringValue
      }
    })

    // Anonymise demandeur in fields
    await this.fieldService.repository.update({
      dossierId: dossier.id,
      sourceId: In(Object.keys(fixFieldValueFunctionsDemandeur)),
    }, {
      stringValue: anomymisedStringValue,
      anonymisedAt: new Date(),
    })

    await this.repo.update(dossier.id, {
      anonymisedAt: new Date(),
      dsDataJson: dossier.dsDataJson,
    })
  }

  private async anonymiseChampsAndAnnotations(
    dossier: Dossier,
    mappingAnonymized: MappingAnonymized[],
  ): Promise<void> {
    this.logger.verbose(`anonymiseDossier for champs and annotations: ${mappingAnonymized}`)

    // Anonymise champs and annotations
    mappingAnonymized.forEach((mapping) => {
      if (mapping.source === 'champs') {
        this.anonymiseChampOrAnnotation(dossier, mapping, 'champs')
      } else if (mapping.source === 'annotation') {
        this.anonymiseChampOrAnnotation(dossier, mapping, 'annotations')
      }
    })

    // Anonymise data in fields
    await this.fieldService.repository.update({
      dossierId: dossier.id,
      sourceId: In(mappingAnonymized.map((mapping) => mapping.id)),
    }, {
      stringValue: anomymisedStringValue,
      dateValue: null,
      numberValue: null,
      rawJson: null,
      anonymisedAt: new Date(),
    })

    await this.repo.update(dossier.id, {
      anonymisedAt: new Date(),
      dsDataJson: dossier.dsDataJson,
    })
  }

  private async anonymiseChampOrAnnotation(
    dossier: Dossier,
    mapping: MappingAnonymized,
    dsDataJsonKey: string,
  ): Promise<void> {
    this.logger.verbose(`anonymiseChampOrAnnotation for dossier: ${dossier.id}, mappingAnonymized: ${mapping}`)
    if (dossier.dsDataJson[dsDataJsonKey]) {
      dossier.dsDataJson[dsDataJsonKey].forEach((champ) => {
        if (champ.id === mapping.id) { // Anonymise champ
          this.logger.debug(`Anonymise champ ${champ.id}`)
          champ.stringValue = anomymisedStringValue
          this.tryAnonymiseFile(champ, dossier.files)
        } else if (champ.__typename === 'RepetitionChamp') { // Anonymise sub champ of repetition champ
          const subChampIdsAnonymise = []
          champ.rows.forEach((row) => {
            row.champs.forEach((ch) => {
              if (ch.champDescriptor.id === mapping.id) {
                this.logger.debug(`Anonymise sub champ of repetition champ ${champ.id}`)
                subChampIdsAnonymise.push(ch.id)
                ch.stringValue = anomymisedStringValue
                this.tryAnonymiseFile(ch, dossier.files)
              }
            })
          })
          champ.champs.forEach((ch) => {
            if (subChampIdsAnonymise.includes(ch.id)) {
              ch.stringValue = anomymisedStringValue
              this.tryAnonymiseFile(ch, dossier.files)
            }
          })
        }
      })
    }
  }

  private async tryAnonymiseFile(champ, files): Promise<void> {
    if (champ.__typename === 'PieceJustificativeChamp') {
      this.logger.verbose(`tryAnonymiseFile champId: ${champ.id}`)
      champ.files.forEach((file) => {
        file.filename = anomymisedFileValue
        files.forEach(async (fileFound) => {
          if (fileFound.sourceStringId === champ.id) {
            this.logger.debug(`Anonymise file ${fileFound.id}`)
            await this.repo.manager.update(File, { id: fileFound.id }, {
              label: anomymisedFileValue,
              uuid: anomymisedFileUuid,
            })
            // Mark file anonymised and keep the uuid for deletion in S3
            fileFound.label = anomymisedFileValue
          }
        })
      })
    }
  }
}
