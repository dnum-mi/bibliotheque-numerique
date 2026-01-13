import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import {
  IDataTableSmallDemarche,
  IPaginatedSmallDemarche,
} from '@biblio-num/shared'

export class PaginatedSmallDemarcheDto
  extends PaginatedDto<IDataTableSmallDemarche>
  implements IPaginatedSmallDemarche {}
