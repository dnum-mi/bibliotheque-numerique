import { FileOutputDto } from './file-output.dto'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { IPaginationFile } from '@biblio-num/shared-utils'

export class PaginationFileDto extends PaginationDto<FileOutputDto> implements IPaginationFile {}
