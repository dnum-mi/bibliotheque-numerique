import { InfoPersonInFoundationDto } from '@/modules/foundation/objects/dto/info-person-in-foundation.dto'

export type PersonMapper = Record<keyof InfoPersonInFoundationDto, string>
