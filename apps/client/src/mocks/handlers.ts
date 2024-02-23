import { http, HttpResponse, type PathParams } from 'msw'
import type { IFileOutput, FileOutputDto, IPagination } from '@biblio-num/shared'

const mimeTypes = {
  'application/pdf': 'pdf',
  'application/msword': 'doc docx odt ods',
  'image/png': 'jpg jpeg png gif tiff tif',
  'application/vnd.ms-excel': 'xls xlsx csv',
}

const getRandomValueFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const sourceLabels = ['rnf', 'rna', 'ds-champ', 'ds-annotation', 'ds-message', 'ds-demandeur', 'bnum'] as const
const states = ['queued', 'uploading', 'failed', 'uploaded'] as const
const tags = {
  statuts: Math.floor(Math.random() * 30),
  comptes: Math.floor(Math.random() * 30),
  'rapport-activites': Math.floor(Math.random() * 30),
  controles: Math.floor(Math.random() * 30),
} as const

const createRandomFileInfo = (tag: keyof typeof tags): FileOutputDto => {
  const randomIndex = Math.floor(Math.random() * 3)
  const [mimeType, extensions] = Object.entries(mimeTypes)[randomIndex]
  const extension = getRandomValueFromArray(extensions.split(' '))
  const filename = `${Math.random().toString(36).substring(7)}`
  const label = `fichier-${filename}.${extension}`
  const originalLabel = `${filename}.${extension}`
  return {
    id: Math.floor(Math.random() * 1000),
    byteSize: Math.floor(Math.random() * 1000000),
    createdAt: new Date(),
    label,
    mimeType,
    originalLabel,
    sourceLabel: getRandomValueFromArray(['bnum', 'bnum', ...sourceLabels, 'bnum', 'bnum', 'bnum']),
    state: getRandomValueFromArray(['uploaded', ...states, 'uploaded']),
    tag,
    updatedAt: new Date(),
    url: `http://localhost:8080/${label}.${getRandomValueFromArray(mimeTypes[mimeType].split(' '))}`,
  }
}

const repeatFn = <T>(fn: (...args: unknown[]) => T) => (times: number): T[] => {
  return Array.from({ length: times }, fn)
}

const createNFileInfo = (tag: keyof typeof tags) => repeatFn(() => createRandomFileInfo(tag))

export const handlers = [
  http.get<PathParams<'id'>>('/api/organismes/:id/files-summary', ({ params }) => {
    // params.id
    return HttpResponse.json(tags)
  }),
  http.post<PathParams, { tag: keyof typeof tags }, {total: number; data: FileOutputDto[]}>('/api/files/list', async ({ request }) => {
    const { filters } = (await request.json()) as IPagination<IFileOutput>
    const tag = filters?.tag.condition1.filter[0]
    const number = tags[tag]
    const files = createNFileInfo(tag)(number)
    const res = { total: number, data: files }
    return HttpResponse.json(res)
  }),
]
