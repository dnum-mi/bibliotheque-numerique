import { FieldTypeKeys } from '@biblio-num/shared'
import { MappingColumn, MappingColumnWithoutChildren } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { MappingAnonymizedWithoutChildren } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'

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

export function findField(mappingColumns: MappingColumn[], fieldId: string)
  : MappingColumnWithoutChildren | MappingAnonymizedWithoutChildren | undefined {
  return mappingColumns
    .map((m) => [m, ...(m.children ?? [])])
    .flat(1)
    .find((f) => f.id === fieldId)
}
