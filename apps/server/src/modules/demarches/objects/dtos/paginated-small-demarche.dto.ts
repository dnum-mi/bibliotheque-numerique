import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import {
  IAgGridSmallDemarche,
  IPaginatedSmallDemarche,
} from '@biblio-num/shared'

export class PaginatedSmallDemarcheDto
  extends PaginatedDto<IAgGridSmallDemarche>
  implements IPaginatedSmallDemarche {}
