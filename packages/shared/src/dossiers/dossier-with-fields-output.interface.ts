import {
  CustomChamp,
  DossierState,
  File,
  Message,
  PersonneMorale,
  PersonnePhysique,
  PieceJustificativeChamp
} from '@dnum-mi/ds-api-client'
import { IDemarche } from 'demarches'
import { IOrganisme } from 'organismes'
import { FormatFunctionRefKeys } from './fields/format-function-ref.enum'
import { StateKey } from 'state'

type OrganismSummary = Pick<IOrganisme, 'id' | 'type' | 'title' | 'idRna' | 'idRnf'>
type DemarcheSummary = Pick<IDemarche, 'id' | 'title' | 'identification'>
export type FileWithState = File & { state?: StateKey }
export type PieceJustificativeChampWithState = Omit<PieceJustificativeChamp, 'file' | 'files'> &
{
  file?: FileWithState,
  files: FileWithState[],
}
export type FieldFileType = Partial<CustomChamp> & PieceJustificativeChampWithState

export interface IFieldSimple {
  id: string
  label: string
  value: string | number | boolean | Date | FieldFileType | null
  type: string
  description: string | null
  format: FormatFunctionRefKeys | null
}

export interface IFieldRepetable extends Omit<IFieldSimple, 'value'> {
  type: 'group'
  rows: IFieldSimple[][]
}

export interface IFieldList {
  id: string
  title: string
  items: (IFieldSimple | IFieldRepetable)[]
}

export interface IDossierFieldsOutput {
  id: number
  organisme: OrganismSummary
  demarche: DemarcheSummary
  sourceId?: string
  prefecture?: string | null
  dateDepot?: Date
  datePassageEnInstruction?: Date
  state?: DossierState
  datePublication?: Date
  demandeur?: PersonneMorale | PersonnePhysique
  demandeurEmail?: string
  champs?: IFieldList[]
  annotations?: IFieldList[]
  messages?: Message[]
}
