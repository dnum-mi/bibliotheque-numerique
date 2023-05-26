import { UpdateDemarcheDto } from 'dto/demarche/update-demarche-ds.dto'

export const filterObjectFields = <T>(
  fields: string[],
  object: UpdateDemarcheDto,
): Partial<T> => {
  return fields.reduce((acc: Partial<T>, field: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore This could really be anything
    acc[field] = object[field]
    return acc
  }, {})
}
