import type { FieldSourceKeys, FieldTypeKeys, IMappingColumn } from '..'

export interface IMappingAnonymizedChampWithoutChildren
  extends Pick<IMappingColumn, 'id'|'originalLabel'|'isHeader'|'originalDescription'|'type'|'source' > {

}

export interface IMappingAnonymizedChamp extends IMappingAnonymizedChampWithoutChildren {
  children?: IMappingAnonymizedChampWithoutChildren[]
}
