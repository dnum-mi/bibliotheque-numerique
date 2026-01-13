import {
  IDataTableSmallDemarche,
  IPaginationSmallDemarche,
} from '@biblio-num/shared'
import { PaginationDto } from '@/shared/pagination/pagination.dto'

export class PaginationSmallDemarcheDto
  extends PaginationDto<IDataTableSmallDemarche>
  implements IPaginationSmallDemarche {}
