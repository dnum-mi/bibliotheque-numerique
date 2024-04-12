import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { FoundationType } from '@prisma/client'
import { Champ, DateChamp } from '@dnum-mi/ds-api-client'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'
import { BadRequestException } from '@nestjs/common'

export const demandeNumeroRnfMapper: Mapper = {
  ...universalMapper,
  type: (ch: Champ | undefined) => {
    if (!ch?.stringValue) {
      throw new BadRequestException('Type de fondation est obligatoire pour une demande de numéro RNF.')
    }
    switch (ch.stringValue) {
    case "Fondation reconnue d'utilité publique (FRUP)":
      return FoundationType.FRUP
    case 'Fonds de dotation':
      return FoundationType.FDD
    case "fondation d'entreprise":
    default:
      return FoundationType.FE
    }
  },
  originalCreatedAt: (ch: DateChamp) => {
    return ch.date ? new Date(ch.date as string) : null
  },
}
