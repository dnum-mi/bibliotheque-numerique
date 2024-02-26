import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'

@Injectable()
export class DossierSynchroniseOrganismeService {
  constructor(
    private readonly logger: LoggerService,
    private readonly organismeService: OrganismeService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
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
  ): Promise<number | undefined> {
    this.logger.verbose('_synchroniseOrganismes')
    const organismeField = this._findOrganismeField(fields)
    let organismeId: number
    if (!organismeField) {
      return
    }

    if (organismeField.dsChampType === DsChampType.RnaChamp) {
      organismeId = await this.organismeService.getOrCreateOrganismeIdFromRna(
        organismeField.stringValue,
      )
      this.logger.debug(
        `Adding Organisme sync for rna:  ${organismeField.stringValue} (with id: ${organismeId})`,
      )
      this.syncQueue.add(eJobName.SyncOneRnaOrganisme, {
        dossierId,
        fieldId: organismeField.id,
        rna: organismeField.stringValue,
      } satisfies SyncOneRnaOrganismeJobPayload)
    } else {
      organismeId = await this.organismeService.getOrCreateOrganismeIdFromRnf(
        organismeField.stringValue,
      )
      this.logger.debug(
        `Adding Organisme sync for rnf:  ${organismeField.stringValue} (with organismeId: ${organismeId})`,
      )
      this.syncQueue.add(eJobName.SyncOneRnfOrganisme, {
        dossierId,
        fieldId: organismeField.id,
        rnf: organismeField.stringValue,
      } satisfies SyncOneRnfOrganismeJobPayload)
    }
    return organismeId
  }
}
