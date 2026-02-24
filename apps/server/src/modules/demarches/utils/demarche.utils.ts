import { FieldTypeKeys } from '@biblio-num/shared'
import { MappingColumn, MappingColumnWithoutChildren } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { MappingAnonymizedWithoutChildren } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'

export type MappingColumnToHash<T> = Record<string, T>

// apply transformer to each column and flatten children
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

// call factory with identity to have full hash
export const fromMappingColumnArrayToHash =
  fromMappingColumnArrayToHashFactory(identity)

// call factory with prop(type) to retrieve hash of types
export const fromMappingColumnArrayToTypeHash =
  fromMappingColumnArrayToHashFactory<FieldTypeKeys>(prop('type'))

// call factory with prop(labels) to have list of labels
export const fromMappingColumnArrayToLabelHash =
  fromMappingColumnArrayToHashFactory<string>(
    prop('columnLabel', 'originalLabel'),
  )

export function findField(mappingColumns: MappingColumn[], fieldId: string)
  : MappingColumnWithoutChildren | MappingAnonymizedWithoutChildren | undefined {
  return mappingColumns
    .map((m) => [m, ...(m.children ?? [])])
    .flat(1)
    .find((f) => f.id === fieldId)
}

// use common code to flatten and retrieve list of column without headers
export const flattenWithoutHeader = (mcs: MappingColumn[]): MappingColumn[] => {
  return Object.values(fromMappingColumnArrayToHash(mcs)).filter(c => !c.isHeader)
}
