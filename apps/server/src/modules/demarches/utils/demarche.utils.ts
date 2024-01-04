import { MappingColumn, FieldTypeKeys } from '@biblio-num/shared'

export type MappingColumnToHash<T> = Record<string, T>

const fromMappingColumnArrayToHashFactory =
  <T>(transformFn: (column: MappingColumn) => T) =>
    (mappingColumns: MappingColumn[]): MappingColumnToHash<T> => {
      return Object.fromEntries(
        mappingColumns
          .map((mc) =>
            mc.children?.length
              ? mc.children.map((mc2) => [mc2.id, transformFn(mc2)])
              : [[mc.id, transformFn(mc)]],
          )
          .flat(1),
      )
    }

const identity: <T>(x: T) => T = (x) => x
const prop =
  <P extends keyof MappingColumn>(p: P, p2?: P) =>
    (x: MappingColumn): MappingColumn[P] =>
      x[p] || x[p2]

export const fromMappingColumnArrayToHash =
  fromMappingColumnArrayToHashFactory(identity)

export const fromMappingColumnArrayToTypeHash =
  fromMappingColumnArrayToHashFactory<FieldTypeKeys>(prop('type'))

export const fromMappingColumnArrayToLabelHash =
  fromMappingColumnArrayToHashFactory<string>(
    prop('columnLabel', 'originalLabel'),
  )
