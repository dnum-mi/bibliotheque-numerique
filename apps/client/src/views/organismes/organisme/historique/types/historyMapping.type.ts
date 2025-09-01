import type { ISiafRnaOutput, ISiafRnfOutput } from '@biblio-num/shared'

interface IHeaderField {
  type: 'header'
  label: string
}

interface IField<TDataSource = ISiafRnaOutput | ISiafRnfOutput> {
  type: 'field'
  key: string
  label: string
  accessor: (value: TDataSource) => string | number | boolean | undefined | null
}

export type HistoryMappingField<TDataSource> = IHeaderField | IField<TDataSource>
