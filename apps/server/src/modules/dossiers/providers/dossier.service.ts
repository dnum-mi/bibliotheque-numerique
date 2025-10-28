import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
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
  anonymisedStringValue,
  anonymisedFileValue,
  anonymisedFileUuid,
  IRole,
  canAccessDemarche,
  canAccessPrefectureInDemarche,
  PrefectureDictionary,
  eIdentificationDemarche,
  IFieldList,
  IFieldSimple,
  FieldFileType,
  IFieldRepetable,
  PrefectureKey,
  PieceJustificativeChampWithState,
  FormatFunctionRef,
} from '@biblio-num/shared'

import { Dossier } from '../objects/entities/dossier.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LeanDossierOutputDto } from '@/modules/dossiers/objects/dto/lean-dossier-output.dto'
import { File } from '../../files/objects/entities/file.entity'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { fixFieldValueFunctionsDemandeur } from '@/modules/dossiers/objects/constante/fix-field-demandeur.dictionnary'
import { MappingAnonymized } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'
import {
  DemarcheOutput,
  DossierWithFieldsOutputDto,
  OrganismeOutput,
} from '../objects/dto/dossier-with-fields-output.dto'
import { Field } from '../objects/entities/field.entity'
import {
  Demandeur,
  PersonneMorale,
  PersonnePhysique,
} from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

interface DataDossierSpecificDS {
  demandeur: PersonnePhysique | PersonneMorale | undefined
  demandeurEmail: string | null
  messages: Message[]
  datePassageEnInstruction: Date | null
}

@Injectable()
export class DossierService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    @InjectRepository(File) protected readonly repoFile: Repository<File>,
    @InjectRepository(Field) protected readonly repoField: Repository<Field>,
    private readonly fieldService: FieldService,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  // #region get dossiers by organismeId
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

  async countDossiersByOrganismeId(organismeId: number): Promise<number> {
    if (isNaN(organismeId)) {
      throw new BadRequestException('Invalid organisme id.')
    }
    this.logger.verbose(`countDossiersByOrganismeId ${organismeId}`)
    return this.repo.count({
      where: { organisme: { id: organismeId } },
    })
  }
  // #endregion get dossiers by organismeId

  async softDeleteDemarcheDossiers(demarcheId: number): Promise<void> {
    this.logger.verbose(`softDeleteDemarcheDossiers ${demarcheId}`)
    await this.repo.softDelete({ demarcheId })
  }

  transformValueFileOfDossier(dossier: Dossier, files: File[]): Dossier {
    this.logger.verbose('transformValueFileOfDossier')
    if (dossier.dsDataJson.champs && Array.isArray(dossier.dsDataJson.champs)) {
      dossier.dsDataJson.champs.forEach(
        this._transformUrlToUuid(
          files.filter((f) => f.sourceLabel === eFileDsSourceLabel['ds-champ']),
        ),
      )
    }
    if (
      dossier.dsDataJson.annotations &&
      Array.isArray(dossier.dsDataJson.annotations)
    ) {
      dossier.dsDataJson.annotations.forEach(
        this._transformUrlToUuid(
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
        this._transformUrlToUuidMessage(
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

  private _transformValueFileOfDossierFields({
    fields,
    files,
  }: {
    fields: Field[]
    files: File[]
  }): Field[] {
    this.logger.verbose('transformValueFileOfDossierFields')
    if (fields.length) {
      fields.forEach((field) => {
        if (field.type === 'file' && field.rawJson) {
          const fileData = field.rawJson as FieldFileType
          if (fileData.id) {
            const fileFound = files.find(
              (f) => String(f.sourceStringId) === String(fileData.id),
            )
            if (fileFound) {
              (field.rawJson as PieceJustificativeChampWithState).files.forEach((f2) => {
                f2.url = fileFound.uuid ?? ''
                f2.state = fileFound.state ?? eState.queued
              })
            } else {
              field.rawJson = null
            }
          }
        }
      })
    }

    return fields
  }

  private _transformValueFileOfMessages({ messages, files }: {messages: Message[], files: File[]}): Message[] {
    this.logger.verbose('_transformValueFileOfMessages')
    if (messages.length) {
      messages.forEach(
        this._transformUrlToUuidMessage(
          files.filter(
            (f) => f.sourceLabel === eFileDsSourceLabel['ds-message'],
          ),
        ),
      )
    }

    return messages
  }

  private _setFileUrlToUuid = (id, files, fileCh, filesCh): void => {
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

  private _transformUrlToUuid(files: File[]) {
    return (ch: Champ): void => {
      if (ch.__typename === 'PieceJustificativeChamp') {
        const fileCh = (ch as PieceJustificativeChamp).file
        const filesCh = (ch as PieceJustificativeChamp).files
        this._setFileUrlToUuid(ch.id, files, fileCh, filesCh)
      }
      if (ch.__typename === 'RepetitionChamp') {
        if ((ch as RepetitionChamp).champs) {
          ;(ch as RepetitionChamp).champs.forEach(
            this._transformUrlToUuid(files),
          )
        }
        if ((ch as RepetitionChamp).rows) {
          ;(ch as RepetitionChamp).rows.forEach((row) =>
            row.champs.forEach(this._transformUrlToUuid(files)),
          )
        }
      }
    }
  }

  private _transformUrlToUuidMessage(files: File[]) {
    return (m: Message): void => {
      const fileCh = m.attachment
      const filesCh = m.attachments
      this._setFileUrlToUuid(m.id, files, fileCh, filesCh)
    }
  }

  async anonymiseDossier(
    dossier: Dossier,
    mappingAnonymized: MappingAnonymized[],
  ): Promise<void> {
    this.logger.verbose(`anonymiseDossier ${dossier.id}`)

    await this._anonymiseDemandeur(dossier)

    if (mappingAnonymized.length !== 0) {
      await this._anonymiseChampsAndAnnotations(dossier, mappingAnonymized)
    }
  }

  private async _anonymiseDemandeur(dossier: Dossier): Promise<void> {
    this.logger.verbose(`anonymiseDemandeur ${dossier.id}`)
    const demandeurKeys = ['nom', 'prenom', 'civilite']

    // Anonymise demandeur in dsDataJson
    demandeurKeys.forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(dossier.dsDataJson.demandeur, key)
      ) {
        dossier.dsDataJson.demandeur[key] = anonymisedStringValue
      }
    })

    // Anonymise demandeur in fields
    await this.fieldService.repository.update(
      {
        dossierId: dossier.id,
        sourceId: In(Object.keys(fixFieldValueFunctionsDemandeur)),
      },
      {
        stringValue: anonymisedStringValue,
        anonymisedAt: new Date(),
      },
    )

    await this.repo.update(dossier.id, {
      anonymisedAt: new Date(),
      dsDataJson: dossier.dsDataJson,
    })
  }

  private async _anonymiseChampsAndAnnotations(
    dossier: Dossier,
    mappingAnonymized: MappingAnonymized[],
  ): Promise<void> {
    this.logger.verbose(
      `anonymiseDossier for champs and annotations: ${mappingAnonymized}`,
    )

    // Anonymise champs and annotations
    mappingAnonymized.forEach((mapping) => {
      if (mapping.source === 'champs') {
        this._anonymiseChampOrAnnotation(dossier, mapping, 'champs')
      } else if (mapping.source === 'annotation') {
        this._anonymiseChampOrAnnotation(dossier, mapping, 'annotations')
      }
    })

    // Anonymise data in fields
    const fields = await this.fieldService.findWithFilter({
      dossierId: dossier.id,
      sourceId: In(mappingAnonymized.map((mapping) => mapping.id)),
    })

    await this.fieldService.repository.update(
      {
        id: In(fields.flatMap((f) => (f.parentId ? [f.parentId, f.id] : f.id))),
      },
      {
        stringValue: anonymisedStringValue,
        dateValue: null,
        numberValue: null,
        rawJson: null,
        anonymisedAt: new Date(),
      },
    )

    const fileIds = dossier.files
      .filter((file) => file.label === anonymisedFileValue)
      .map((file) => file.id)
    if (fileIds.length > 0) {
      await this.repo.manager.update(
        File,
        { id: In(fileIds) },
        {
          label: anonymisedFileValue,
          uuid: anonymisedFileUuid,
        },
      )
    }

    await this.repo.update(dossier.id, {
      anonymisedAt: new Date(),
      dsDataJson: dossier.dsDataJson,
    })
  }

  private _anonymiseChampOrAnnotation(
    dossier: Dossier,
    mapping: MappingAnonymized,
    dsDataJsonKey: string,
  ): void {
    this.logger.verbose(
      `anonymiseChampOrAnnotation for dossier: ${dossier.id}, mappingAnonymized: ${mapping}`,
    )
    if (dossier.dsDataJson[dsDataJsonKey]) {
      dossier.dsDataJson[dsDataJsonKey].forEach((champ) => {
        if (champ.id === mapping.id) {
          // Anonymise champ
          this.logger.debug(`Anonymise champ ${champ.id}`)
          champ.stringValue = anonymisedStringValue
          this._tryAnonymiseFile(champ, dossier.files)
        } else if (champ.__typename === 'RepetitionChamp') {
          // Anonymise sub champ of repetition champ
          const subChampIdsAnonymise = []
          champ.rows?.forEach((row) => {
            row.champs.forEach((ch) => {
              if (ch.champDescriptor.id === mapping.id) {
                this.logger.debug(
                  `Anonymise sub champ of repetition champ ${champ.id}`,
                )
                subChampIdsAnonymise.push(ch.id)
                ch.stringValue = anonymisedStringValue
                this._tryAnonymiseFile(ch, dossier.files)
              }
            })
          })
          champ.champs?.forEach((ch) => {
            if (subChampIdsAnonymise.includes(ch.id)) {
              ch.stringValue = anonymisedStringValue
              this._tryAnonymiseFile(ch, dossier.files)
            }
          })
        }
      })
    }
  }

  private _tryAnonymiseFile(champ, files): void {
    if (champ.__typename === 'PieceJustificativeChamp') {
      this.logger.verbose(`tryAnonymiseFile champId: ${champ.id}`)
      champ.files.forEach((file) => {
        file.filename = anonymisedFileValue
        files.forEach((fileFound) => {
          if (fileFound.sourceStringId === champ.id) {
            this.logger.debug(`Anonymise file ${fileFound.id}`)
            // Mark file anonymised and keep the uuid for deletion in S3
            fileFound.label = anonymisedFileValue
          }
        })
      })
    }
  }

  public async getAndValidateDossierForRole(
    id: number,
    role: IRole,
  ): Promise<{
    dossier: Dossier
    hasFullAccess: boolean
  }> {
    const dossier = await this.getDossier(id)
    if (!dossier) {
      throw new NotFoundException('Ressource introuvable')
    }

    if (!canAccessDemarche(dossier.demarche.id, role)) {
      throw new ForbiddenException(
        'Vous n’avez pas accès à la démarche correspondante à ce dossier',
      )
    }

    const hasFullAccess = canAccessPrefectureInDemarche(
      dossier.prefecture,
      role,
      dossier.demarche.id,
    )

    return {
      dossier,
      hasFullAccess,
    }
  }

  async getDossier(
    id: number,
  ): Promise<Dossier> {
    return await this.repo
      .createQueryBuilder('dossier')
      .leftJoinAndSelect('dossier.demarche', 'demarche')
      .leftJoinAndSelect('dossier.organisme', 'organisme')
      .select([
        'dossier.id',
        'dossier.prefecture',
        'dossier.dateDepot',
        'dossier.state',
        'dossier.sourceId',
        'dossier.dsDataJson',
        'demarche.id',
        'demarche.title',
        'demarche.identification',
        'demarche.mappingColumns',
        'organisme.id',
        'organisme.type',
        'organisme.title',
        'organisme.idRna',
        'organisme.idRnf',
      ])
      .where('dossier.id = :id', { id })
      .getOne()
  }

  async mapDossierWithFiles(dossier: Dossier, hasFullAccess: boolean): Promise<Dossier> {
    const files = await this.repoFile.find({ where: { dossier: { id: dossier.id } } })
    const dossierWithFiles = this.transformValueFileOfDossier(
      dossier,
      files,
    )

    const { annotations, messages, ...restOfDsDataJson } = dossierWithFiles.dsDataJson

    return {
      ...dossier,
      dsDataJson: {
        ...restOfDsDataJson,
        ...(hasFullAccess ? { annotations, messages } : {}),
      },
    }
  }

  async mapDossierToFieldsOutput(
    dossier: Dossier,
    hasFullAccess: boolean,
  ): Promise<DossierWithFieldsOutputDto> {
    this.logger.verbose(`mapToFieldsOutput ${dossier.id}`)

    const isMaarchDossier = this._isMaarchDemarche(dossier.demarche)

    const [fields, files] = await Promise.all([
      await this.repoField.find({ where: { dossier: { id: dossier.id } } }),
      await this.repoFile.find({ where: { dossier: { id: dossier.id } } }),
    ])

    const fieldsTransformed = this._transformValueFileOfDossierFields({
      fields,
      files,
    })

    if (hasFullAccess && !isMaarchDossier) {
      dossier.dsDataJson.messages = this._transformValueFileOfMessages({
        messages: dossier.dsDataJson.messages,
        files,
      })
    }

    const reconstructedFields = await this._reconstructFieldsWithMapping(
      dossier.demarche.mappingColumns,
      fieldsTransformed,
    )

    const specificData = this._extractDataDossierSpecificDS(
      dossier,
      isMaarchDossier,
    )

    const baseDto = this._buildBaseDossierDto(
      dossier,
      reconstructedFields,
      specificData,
    )

    return hasFullAccess ? baseDto : this._applyAccessRestrictions(baseDto)
  }

  private _isMaarchDemarche(demarche: Demarche): boolean {
    return demarche.identification === eIdentificationDemarche.MAARCH
  }

  private _extractDataDossierSpecificDS(
    dossier: Dossier,
    isMaarch: boolean,
  ): DataDossierSpecificDS {
    if (isMaarch) {
      return {
        demandeur: undefined,
        demandeurEmail: null,
        messages: [],
        datePassageEnInstruction: null,
      }
    }

    return {
      demandeur: this._extractDemandeur(
        dossier.dsDataJson.demandeur as Demandeur & { __typename: string },
      ),
      demandeurEmail: dossier.dsDataJson.usager?.email ?? null,
      messages: dossier.dsDataJson.messages ?? [],
      datePassageEnInstruction: dossier.dsDataJson.datePassageEnInstruction,
    }
  }

  private _extractDemandeur(
    demandeur: Demandeur & { __typename: string },
  ): PersonnePhysique | PersonneMorale {
    return demandeur.__typename === 'PersonnePhysique'
      ? (demandeur as PersonnePhysique)
      : (demandeur as PersonneMorale)
  }

  private _buildBaseDossierDto(
    dossier: Dossier,
    reconstructedFields: { champs: IFieldList[]; annotations: IFieldList[] },
    specificData: DataDossierSpecificDS,
  ): DossierWithFieldsOutputDto {
    return {
      id: dossier.id,
      organisme: this._buildOrganismeDto(dossier.organisme),
      demarche: this._buildDemarcheDto(dossier.demarche),
      prefecture: this._getPrefectureInfo(dossier.prefecture),
      dateDepot: dossier.dateDepot,
      state: dossier.state,
      sourceId: dossier.sourceId,
      datePassageEnInstruction: specificData.datePassageEnInstruction,
      demandeur: specificData.demandeur,
      champs: reconstructedFields.champs,
      annotations: reconstructedFields.annotations,
      files: dossier.files,
      demandeurEmail: specificData.demandeurEmail,
      messages: specificData.messages,
    }
  }

  private _buildOrganismeDto(
    organisme: Organisme | null | undefined,
  ): OrganismeOutput | null {
    if (!organisme) {
      return null
    }

    return {
      id: organisme.id,
      type: organisme.type,
      title: organisme.title ?? undefined,
      idRna: organisme.idRna,
      idRnf: organisme.idRnf,
    }
  }

  private _buildDemarcheDto(demarche: Demarche): DemarcheOutput {
    return {
      id: demarche.id,
      title: demarche.title,
      identification: demarche.identification,
    }
  }

  private _getPrefectureInfo(
    prefecture: string | null | undefined,
  ): (typeof PrefectureDictionary)[keyof typeof PrefectureDictionary] | null {
    return prefecture && prefecture in PrefectureDictionary
      ? PrefectureDictionary[prefecture as PrefectureKey]
      : null
  }

  private _applyAccessRestrictions(
    fullDto: DossierWithFieldsOutputDto,
  ): DossierWithFieldsOutputDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { annotations, messages, ...restrictedDto } = fullDto
    return restrictedDto
  }

  private async _reconstructFieldsWithMapping(
    mapping: MappingColumn[],
    fields: Field[],
  ): Promise<{ champs: IFieldList[]; annotations: IFieldList[] }> {
    const activeMapping = mapping.filter((col) => col.source !== 'fix-field')
    const activeFields = fields.filter(
      (field) => field.fieldSource !== 'fix-field',
    )

    const result = {
      champsGroups: [] as IFieldList[],
      annotationsGroups: [] as IFieldList[],
    }

    const currentGroups = {
      champs: null as IFieldList | null,
      annotations: null as IFieldList | null,
    }

    const { fieldMap, childrenMap } = this._buildFieldMaps(activeFields)

    for (const column of activeMapping) {
      if (column.isHeader) {
        this._handleHeaderColumn(column, result, currentGroups)
        continue
      }

      const field = fieldMap.get(column.id)
      if (!field) continue

      const processedItem = this._processFieldItem(column, field, childrenMap)
      this._addItemToGroup(column, processedItem, result, currentGroups)
    }

    return {
      champs: result.champsGroups.filter((g) => g.items.length > 0),
      annotations: result.annotationsGroups.filter((g) => g.items.length > 0),
    }
  }

  private _buildFieldMaps(fields: Field[]): {
    fieldMap: Map<string, Field>
    childrenMap: Map<string, Field[]>
  } {
    const fieldMap = new Map<string, Field>()
    const childrenMap = new Map<string, Field[]>()

    for (const field of fields) {
      if (field.parentId) {
        const parentIdStr = String(field.parentId)
        if (!childrenMap.has(parentIdStr)) {
          childrenMap.set(parentIdStr, [])
        }
        childrenMap.get(parentIdStr)!.push(field)
      } else {
        fieldMap.set(field.sourceId, field)
      }
    }

    return { fieldMap, childrenMap }
  }

  private _extractFieldValue(
    field: Field,
  ): string | number | boolean | Date | FieldFileType | null {
    if (field.formatFunctionRef === FormatFunctionRef.prefecture) {
      return PrefectureDictionary[field.stringValue as PrefectureKey]
    }
    switch (field.type) {
    case 'boolean':
      return field.stringValue === 'true'
    case 'file':
      return field.rawJson as FieldFileType
    default:
      return field.stringValue
    }
  }

  private _handleHeaderColumn(
    column: MappingColumn,
    result: { champsGroups: IFieldList[]; annotationsGroups: IFieldList[] },
    currentGroups: {
      champs: IFieldList | null
      annotations: IFieldList | null
    },
  ): void {
    const newGroup: IFieldList = {
      id: column.id,
      title: column.originalLabel,
      items: [],
    }

    if (column.source === 'champs') {
      result.champsGroups.push(newGroup)
      currentGroups.champs = newGroup
    } else {
      result.annotationsGroups.push(newGroup)
      currentGroups.annotations = newGroup
    }
  }

  private _processFieldItem(
    column: MappingColumn,
    field: Field,
    childrenMap: Map<string, Field[]>,
  ): IFieldSimple | IFieldRepetable {
    const baseProperties = {
      id: column.id,
      label: column.columnLabel || column.originalLabel,
      description: column.originalDescription,
      format: column.formatFunctionRef,
    }

    if (column.children && childrenMap.has(String(field.id))) {
      const childrenFields = childrenMap.get(String(field.id))!
      const rows = this._processChildrenRows(childrenFields, column.children)

      return {
        ...baseProperties,
        type: 'group' as const,
        rows,
      }
    }

    return {
      ...baseProperties,
      value: this._extractFieldValue(field),
      type: column.type,
    }
  }

  private _processChildrenRows(
    childrenFields: Field[],
    childColumns: MappingColumn[],
  ): IFieldSimple[][] {
    const rowsByIndex = new Map<number, Field[]>()

    for (const child of childrenFields) {
      if (child.parentRowIndex !== null) {
        if (!rowsByIndex.has(child.parentRowIndex)) {
          rowsByIndex.set(child.parentRowIndex, [])
        }
        rowsByIndex.get(child.parentRowIndex)!.push(child)
      }
    }

    return Array.from(rowsByIndex.values()).map((rowFields) =>
      this._buildRowFromFields(rowFields, childColumns),
    )
  }

  private _buildRowFromFields(
    rowFields: Field[],
    childColumns: MappingColumn[],
  ): IFieldSimple[] {
    return childColumns
      .map((childColumn) => {
        const field = rowFields.find((f) => f.sourceId === childColumn.id)
        if (!field) return null

        return {
          id: childColumn.id,
          label: childColumn.columnLabel || childColumn.originalLabel,
          value: this._extractFieldValue(field),
          type: childColumn.type,
          format: childColumn.formatFunctionRef,
          description: childColumn.originalDescription,
        } as IFieldSimple
      })
      .filter((item): item is IFieldSimple => item !== null)
  }

  private _addItemToGroup(
    column: MappingColumn,
    item: IFieldSimple | IFieldRepetable,
    result: { champsGroups: IFieldList[]; annotationsGroups: IFieldList[] },
    currentGroups: {
      champs: IFieldList | null
      annotations: IFieldList | null
    },
  ): void {
    const isChamps = column.source === 'champs'
    const targetGroups = isChamps
      ? result.champsGroups
      : result.annotationsGroups
    const currentGroup = isChamps
      ? currentGroups.champs
      : currentGroups.annotations

    if (!currentGroup) {
      const defaultGroup: IFieldList = {
        id: isChamps ? 'default-champs' : 'default-annotations',
        title: isChamps ? 'Informations Générales' : 'Annotations Générales',
        items: [item],
      }

      targetGroups.push(defaultGroup)
      if (isChamps) {
        currentGroups.champs = defaultGroup
      } else {
        currentGroups.annotations = defaultGroup
      }
    } else {
      currentGroup.items.push(item)
    }
  }
}
