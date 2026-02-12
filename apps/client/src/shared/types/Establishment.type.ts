import { createEnum } from '@biblio-num/shared'

export const establishmentStatusArray = ['ACQUIS', 'SECONDAIRE', 'CÉDÉ'] as const
export type EstablishmentStatusKey = (typeof establishmentStatusArray)[number]
export const eEstablishmentStatus = createEnum(establishmentStatusArray)
