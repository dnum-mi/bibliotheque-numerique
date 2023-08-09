import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { FoundationType } from '@prisma/client'
import { Champ } from '@dnum-mi/ds-api-client'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'

export const DemandeNumeroRnfMapper: Mapper = {
  ...universalMapper,
  type: (ch: Champ) => {
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
}
