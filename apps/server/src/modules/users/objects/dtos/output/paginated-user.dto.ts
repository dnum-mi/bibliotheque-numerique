import { DataTableUserDto } from './datatable-user.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { IPaginatedUser } from '@biblio-num/shared'

export class PaginatedUserDto extends PaginatedDto<DataTableUserDto> implements IPaginatedUser {}
