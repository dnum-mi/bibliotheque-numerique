import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class DossierSynchroniseOrganismeService {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    @InjectRepository(Field) protected readonly fieldRepo: Repository<Field>,
    private logger: LoggerService,
    private readonly organismeService: OrganismeService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _synchroniseOneField(field: Field, idDossier: number): Promise<void> {
    this.logger.verbose('_synchroniseRnf')
    try {
      const idOrganisme = await field.dsChampType === DsChampType.RnaChamp
        ? await this.organismeService.associateOrganismeFromRna(field.stringValue)
        : await this.organismeService.associateOrganismeFromRnf(field.stringValue)
      await this.repo.update(
        { id: idDossier },
        { organisme: { id: idOrganisme } },
      )
    } catch (e) {
      this.logger.error(e)
      await this.fieldRepo.update({ id: field.id }, { stringValue: 'ERROR-' + field.stringValue })
      // correct this catch + throw code when managing syncronising error on higher level
      throw e
    }
  }

  async synchroniseOrganismes(
    idDossier: number,
    fields: Field[],
  ): Promise<void> {
    this.logger.verbose('synchroniseOrganismes')
    for (const field of fields) {
      if (
        [DsChampType.RnaChamp, DsChampType.RnfChamp].includes(
          field.dsChampType,
        ) &&
        field.stringValue.length
      ) {
        await this._synchroniseOneField(field, idDossier)
        break
      }
    }
  }
}
