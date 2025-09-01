import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import {
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { DossierState } from '@dnum-mi/ds-api-client'
import { eFieldCode } from '@/modules/dossiers/objects/constante/field-code.enum'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { pushIfMissing } from '@/shared/utils/array.utils'
import { isNumber } from 'class-validator'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'

@Injectable()
export class DossierSynchroniseOrganismeService {
  constructor(
    private readonly logger: LoggerService,
    private readonly fieldService: FieldService,
    private readonly organismeService: OrganismeService,
    private readonly customBullService: CustomBullService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private _findOrganismeField(fields: Field[]): Field {
    this.logger.verbose('_findOrganismeField')
    return fields.find((field: Field) => {
      return (
        field.stringValue.length &&
        ([DsChampType.RnaChamp, DsChampType.RnfChamp].includes(
          field.dsChampType,
        ) ||
          field.rawJson?.champDescriptor?.description?.match(
            /.*#bn-rnf-field-bn#.*/,
          ))
      )
    })
  }

  public async synchroniseOrganismeFromFields(
    fields: Field[],
    dossierId: number,
  ): Promise<Organisme | undefined> {
    this.logger.verbose('_synchroniseOrganismes')
    const organismeField = this._findOrganismeField(fields)
    let organisme: Organisme
    if (!organismeField) {
      return
    }
    // TODO: Trouver un mellieux solution - queue présent même s'il n'y a pas raison
    // await this.fieldService.repository.update({
    //   id: organismeField.id,
    // }, {
    //   stringValue: 'QUEUE-' + organismeField.stringValue,
    // })

    if (organismeField.dsChampType === DsChampType.RnaChamp) {
      organisme = await this.organismeService.getOrCreateOrganismeIdFromRna(
        organismeField.stringValue,
      )
      this.logger.debug(
        `Adding Organisme sync for rna:  ${organismeField.stringValue} (with id: ${organisme.id})`,
      )
      await this.customBullService.addSyncOneRnaOrganismeJob({
        dossierId,
        fieldId: organismeField.id,
        rna: organismeField.stringValue,
      } satisfies SyncOneRnaOrganismeJobPayload)
    } else {
      organisme = await this.organismeService.getOrCreateOrganismeIdFromRnf(
        organismeField.stringValue,
      )
      this.logger.debug(
        `Adding Organisme sync for rnf:  ${organismeField.stringValue} (with organismeId: ${organisme.id})`,
      )
      await this.customBullService.addSyncOneRnfOrganismeJob({
        dossierId,
        fieldId: organismeField.id,
        rnf: organismeField.stringValue,
        firstTime: !organisme.rnfJson,
      } satisfies SyncOneRnfOrganismeJobPayload)
    }

    return organisme
  }

  public async updateDeclarationYearFromDossier(
    state: DossierState,
    organisme: Organisme,
    fields: Field[],
  ): Promise<void> {
    this.logger.verbose('updateDeclarationYearFromDossier')
    if (state !== DossierState.Accepte && state !== DossierState.Refuse) {
      this.logger.debug(`Dossier state is ${state}. Nothing to do.`)
      return
    }
    const year = fields.find((f) => f.code === eFieldCode['account-year'])
      ?.numberValue
    if (!isNumber(year)) {
      this.logger.warn('No deposit year field inside the DDC dossier.')
      return
    }
    if (state === DossierState.Accepte) {
      this.logger.debug(`Adding ${year} into declarationYears.`)
      pushIfMissing(organisme.declarationYears, year)
      organisme.missingDeclarationYears =
        organisme.missingDeclarationYears.filter((y) => y !== year)
    }
    if (state === DossierState.Refuse) {
      this.logger.debug(`Adding ${year} into missing years.`)
      pushIfMissing(organisme.missingDeclarationYears, year)
      organisme.declarationYears = organisme.declarationYears.filter(
        (y) => y !== year,
      )
    }
    await this.organismeService.repository.update(
      {
        id: organisme.id,
      },
      {
        declarationYears: organisme.declarationYears,
        missingDeclarationYears: organisme.missingDeclarationYears,
      },
    )
  }
}
