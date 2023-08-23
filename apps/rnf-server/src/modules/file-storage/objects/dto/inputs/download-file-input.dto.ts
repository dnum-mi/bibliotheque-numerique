import { IsDefined, IsString } from 'class-validator'

export class DownloadFileInputDto {
  @IsDefined()
  @IsString()
    uuid: string
}
