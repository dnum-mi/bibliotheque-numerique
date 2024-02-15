import { PaginatedDto } from '../pagination'
import { FileOutputDto } from './file-output.dto'

export class PaginatedFileDto extends PaginatedDto<FileOutputDto> {}
