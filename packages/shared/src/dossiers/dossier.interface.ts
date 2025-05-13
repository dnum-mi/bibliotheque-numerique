import type {
  AddressChamp,
  CheckboxChamp,
  CiviliteChamp,
  DepartementChamp,
  DossierState,
  File,
  PieceJustificativeChamp,
  RepetitionChamp,
  Dossier as TDossier,
  TextChamp,
} from '@dnum-mi/ds-api-client'
import type { IDemarche } from '../demarches'
import type { PrefectureKey } from '../prefectures'

export interface IDossier {
  id: number
  demarcheId: number
  demarche?: IDemarche
  state: DossierState
  prefecture: PrefectureKey | null
  sourceId: string
  dsDataJson: Partial<TDossier>
  anonymisedAt: Date | null
}

/* interface ChampDescriptor {
  id: string
  type:
    | 'header_section'
    | 'drop_down_list'
    | 'departements'
    | 'rna'
    | 'explication'
    | 'text'
    | 'checkbox'
    | 'address'
    | 'phone'
    | 'email'
    | 'civilite'
    | 'piece_justificative'
    | 'repetition'
    | 'pays'
    | 'integer_number'
  label: string
  required: boolean
  __typename: string
  description: string | null
  champDescriptors: ChampDescriptor[] | null
}

interface Departement {
  code: string
  name: string
}

interface BaseChamp {
  id: string
  label: string
  __typename: string
  stringValue: string
  champDescriptor: ChampDescriptor
}

interface TextChamp extends BaseChamp {
  __typename: 'TextChamp'
}

interface DepartementChamp extends BaseChamp {
  __typename: 'DepartementChamp'
  departement: Departement | null
}

interface CheckboxChamp extends BaseChamp {
  __typename: 'CheckboxChamp'
  checked: boolean
}

interface AddressChamp extends BaseChamp {
  __typename: 'AddressChamp'
  address: { [key: string]: any } | null
}

interface CiviliteChamp extends BaseChamp {
  __typename: 'CiviliteChamp'
  civilite: string
}

interface PieceJustificativeChamp extends BaseChamp {
  __typename: 'PieceJustificativeChamp'
  files: File[]
}

interface RepetitionChamp extends BaseChamp {
  __typename: 'RepetitionChamp'
  rows: { champs: Champ[] }[]
  champs: Champ[]
} */

export type IChamp =
  | TextChamp
  | DepartementChamp
  | CheckboxChamp
  | AddressChamp
  | CiviliteChamp
  | PieceJustificativeChamp
  | RepetitionChamp
