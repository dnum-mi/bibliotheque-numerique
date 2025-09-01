import { AgGridUserDto } from '../output'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { IPaginationUser } from '@biblio-num/shared'

export class PaginationUserDto extends PaginationDto<AgGridUserDto> implements IPaginationUser {}
