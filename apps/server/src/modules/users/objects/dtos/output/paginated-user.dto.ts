import { AgGridUserDto } from './ag-grid-user.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { IPaginatedUser } from '@biblio-num/shared'

export class PaginatedUserDto extends PaginatedDto<AgGridUserDto> implements IPaginatedUser {}
