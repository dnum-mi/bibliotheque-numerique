import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Injectable } from '@nestjs/common'
import { DataFormatterService } from './data-formatter.service'
import { FieldBuilderService } from './field-builder.service'
import { FileBuilderService } from './file-builder.service'
import { DemandeAggregee } from '@/modules/demarches/objects/constants/maarch.types'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { DossierState } from '@dnum-mi/ds-api-client'
import { maarchChampsLabel } from '@/modules/demarches/objects/constants/maarch-champ.enum'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { maarchFieldMappingsArray } from '@/modules/demarches/objects/constants/maarch-champ.dictionary'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

@Injectable()
export class DossierTransformerService {
  constructor(
    private readonly logger: LoggerService,
    private readonly fieldBuilder: FieldBuilderService,
    private readonly fileBuilder: FileBuilderService,
    private readonly dataFormatter: DataFormatterService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async transformToEntities(
    aggregatedData: DemandeAggregee[],
    demarche: Demarche,
  ): Promise<Dossier[]> {
    return aggregatedData.map((data) =>
      this.createDossier(data, demarche),
    )
  }

  private createDossier(
    data: DemandeAggregee,
    demarche: Demarche,
  ): Dossier {
    const dossier = new Dossier()

    dossier.demarcheId = demarche.id
    dossier.state = data[maarchChampsLabel.etatDossier] as DossierState
    dossier.sourceId = data[maarchChampsLabel.courrier]
    dossier.dateDepot = data[maarchChampsLabel.dateDeclaration]
    dossier.prefecture = this.dataFormatter.getPrefectureKey(
      data[maarchChampsLabel.prefecture],
    )
    dossier.files = this.fileBuilder.createFileEntities(data)
    dossier.fields = this._createAllFields(data)

    return dossier
  }

  private _createAllFields(data: DemandeAggregee): Field[] {
    const allFields: Field[] = []

    for (const mapping of maarchFieldMappingsArray) {
      const fields = this._processMapping(mapping, data)
      if (fields && fields.length > 0) {
        allFields.push(...fields)
      }
    }

    return allFields
  }

  private _processMapping(mapping: MappingColumn, data: DemandeAggregee): Field[] | null {
    if (this._isRepeatableField(mapping)) {
      return this.fieldBuilder.createRepeatableFields(mapping, data)
    }

    const field = this.fieldBuilder.createSimpleField(mapping, data)
    return field ? [field] : null
  }

  private _isRepeatableField(mapping: MappingColumn): boolean {
    return mapping.children && mapping.children.length > 0
  }
}
