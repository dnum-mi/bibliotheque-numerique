import type { FieldSourceKeys, FieldTypeKeys, IMappingColumn } from '..'

export interface IMappingAnonymousWithoutChildren
  extends Pick<IMappingColumn, 'id'|'originalLabel'|'isHeader'|'originalDescription'|'type'|'source' > {

}

export interface IMappingAnonymous extends IMappingAnonymousWithoutChildren {
  children?: IMappingAnonymousWithoutChildren[]
}

export interface IMappingAnonymousSelected extends IMappingAnonymous {

}
