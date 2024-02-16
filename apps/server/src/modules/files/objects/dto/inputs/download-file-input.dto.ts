import { IsDefined, IsString, IsUUID } from 'class-validator'

export class DownloadFileInputDto {
  @IsDefined()
  @IsString()
  @IsUUID()
  uuid: string
}
