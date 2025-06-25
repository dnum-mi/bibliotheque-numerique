import { File } from '../entities/file.entity'

export type tFileCommon = Pick<File, 'sourceLabel'|'storageIn'|'organismeId'|'state'>
