import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'

type ExtendedCreateFoundationDto = CreateFoundationDto & { rnfId: string }

export type RnfFieldKey = Record<keyof ExtendedCreateFoundationDto, RegExp>
