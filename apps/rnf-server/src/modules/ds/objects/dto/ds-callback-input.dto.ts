import { IsDefined } from 'class-validator'

// This DTO doesn't use camelCase because it is from DS external API
export class DsCallbackInputDto {
  @IsDefined()
  dossier_id: string

  @IsDefined()
  procedure_id: string

  @IsDefined()
  state: string

  @IsDefined()
  updated_at: Date
}
