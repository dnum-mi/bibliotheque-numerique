import { FileOutputDto } from './file-output.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { IPaginatedFile } from '@biblio-num/shared-utils'

export class PaginatedFileDto extends PaginatedDto<FileOutputDto> implements IPaginatedFile {}
