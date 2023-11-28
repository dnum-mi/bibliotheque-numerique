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
    private logger: LoggerService,
    private readonly organismeService: OrganismeService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async synchroniseOrganismes(
    idDossier: number,
    fields: Field[],
  ): Promise<void> {
    this.logger.verbose('synchroniseOrganismes')
    for (const field of fields) {
      if (
        field.dsChampType === DsChampType.RnfChamp &&
        field.stringValue.length
      ) {
        const idOrganisme =
          await this.organismeService.associateOrganismeFromRnf(
            field.stringValue,
          )
        await this.repo.update(
          { id: idDossier },
          { organisme: { id: idOrganisme } },
        )
        break
      }
      if (
        field.dsChampType === DsChampType.RnaChamp &&
        field.stringValue.length
      ) {
        const idOrganisme =
          await this.organismeService.associateOrganismeFromRna(
            field.stringValue,
          )
        await this.repo.update(
          { id: idDossier },
          { organisme: { id: idOrganisme } },
        )
        break
      }
    }
  }
}
