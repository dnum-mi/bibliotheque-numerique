import { createEnum } from '@biblio-num/shared'

export const fileStorageIn = ['S3', 'HUB'] as const
export type FileStorageInKey = (typeof fileStorageIn)[number]

export const eFileStorageIn = createEnum(fileStorageIn)
