import { eFileTag, FileTagKey } from '@biblio-num/shared'
import { TagDefinition } from '@/modules/files/objects/types/tag-definition.type'

export const tagDictionary: Record<FileTagKey, TagDefinition> = {
  [eFileTag.status]: {
    title: 'Status',
    tag: eFileTag.status,
    code: 'status',
  },
  [eFileTag.account]: {
    title: 'Dépôt de compte',
    tag: eFileTag.account,
    code: 'depot-de-compte',
  },
  [eFileTag['excel-fe']]: {
    title: null,
    tag: eFileTag['excel-fe'],
    code: 'financement-étranger-excel',
  },
}

export const tagCodeDictionary: Record<string, TagDefinition> = Object.fromEntries(
  Object.keys(tagDictionary).map((key) => [
    tagDictionary[key].code,
    tagDictionary[key],
  ]),
)

export const allCodes = Object.keys(tagCodeDictionary)
