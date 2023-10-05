import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { InfoPersonInFoundationDto } from '@/modules/foundation/objects/dto/info-person-in-foundation.dto'

type ExtendedCreateFoundationDto = CreateFoundationDto & { rnfId: string }

export type RnfFieldKey = Record<keyof ExtendedCreateFoundationDto, RegExp>
  & Record<keyof InfoPersonInFoundationDto, RegExp>
