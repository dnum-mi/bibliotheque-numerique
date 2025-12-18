import { OmitType } from '@nestjs/swagger'
import { RecentlyConsultedOrganismeOutputDto } from '../output'

export class AddRecentlyConsultedOrganismeInputDto extends OmitType(
  RecentlyConsultedOrganismeOutputDto,
  ['consultedAt'],
) {}
