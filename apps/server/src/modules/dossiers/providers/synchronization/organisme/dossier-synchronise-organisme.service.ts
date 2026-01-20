import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { ISiafOrganisme } from '@biblio-num/shared'
import { HubService } from '@/modules/hub/providers/hub.service'

@Injectable()
export class DossierSynchroniseOrganismeService {
  constructor(
    private readonly logger: LoggerService,
    private readonly fieldService: FieldService,
    private readonly hubService: HubService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private _findOrganismeFields(fields: Field[]): Field[] {
    this.logger.verbose('_findOrganismeFields')
    return fields.filter((field: Field) => {
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

  public async attachOrganismeRefToOneField(organismeField: Field): Promise<void> {
    let organisme: ISiafOrganisme | undefined
    let typeOrganisme:string
    try {
      if (organismeField.dsChampType === DsChampType.RnaChamp || organismeField.formatFunctionRef === 'rna') {
        typeOrganisme = 'Association'
        organisme = await this.hubService.getAssociation(organismeField.stringValue)
      } else {
        typeOrganisme = 'Fondation'
        organisme = await this.hubService.getFoundation(organismeField.stringValue)
      }

      if (organisme) {
        const newStringValue = `${organismeField.stringValue} | ${organisme?.title}`
        this.logger.debug(newStringValue)
        await this.fieldService.repository.update({
          id: organismeField.id,
        }, {
          stringValue: newStringValue,
        })
      } else {
        this.logger.warn(`Not found ${typeOrganisme}  ${organismeField.stringValue}`)
      }
    } catch (e) {
      this.logger.error(`Echec récupération de cet organisme: ${organismeField.stringValue}`)
      this.logger.error(e)
    }
  }

  public async attachOrganismeRefsToFields(
    fields: Field[],
  ): Promise<string[] | undefined> {
    this.logger.verbose('_synchroniseOrganismes')
    const organismeFields = this._findOrganismeFields(fields)
    if (!organismeFields?.length) {
      return
    }

    const organismeRefs = [...new Set(organismeFields.map(field => field.stringValue))]

    for (const organismeField of organismeFields) {
      await this.attachOrganismeRefToOneField(organismeField)
    }

    return organismeRefs
  }
}
