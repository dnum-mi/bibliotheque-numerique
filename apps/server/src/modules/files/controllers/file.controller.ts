import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Response,
} from '@nestjs/common'
import * as contentDisposition from 'content-disposition'
import { ApiTags } from '@nestjs/swagger'
import { FileService } from '../providers/file.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { isUUID } from 'class-validator'
import { Roles, eState } from '@biblio-num/shared'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { eFileStorageIn } from '../objects/const/file-storage-in.enum'
import { HubService } from '@/modules/hub/providers/hub.service'

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(
    private readonly logger: LoggerService,
    private readonly s3Service: S3Service,
    private readonly filesService: FileService,
    private readonly hubService: HubService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @UsualApiOperation({
    summary: 'Télécharge un fichier à partir de son uuid.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Get(':uuid')
  @Role(Roles.instructor)
  async download(
    @Param('uuid') uuid: string,
    @Response() response,
  ): Promise<void> {
    this.logger.verbose('download file')
    if (!isUUID(uuid)) {
      throw new BadRequestException('uuid is not valid')
    }
    const smallFile = await this.filesService.findOneWithUuid(uuid)
    if (smallFile.state !== eState.uploaded) {
      throw new BadRequestException('file is not ready yet.')
    }
    this.logger.debug(smallFile)

    response.setHeader(
      'Content-Disposition',
      contentDisposition(FileService.buildCompleteName(smallFile))
        .replace(/\?/g, '_'), // le module content-disposition remplace les caractére interdit par '?'
    )

    let stream
    if (smallFile.storageIn === eFileStorageIn.HUB) {
      // TODO: variable d'environnement pour le hub est false => sortir
      if (!smallFile.organisme || !(smallFile.organisme.idRna || smallFile.organisme.idRnf)) {
        throw new NotFoundException('Le fichier n\'est pas relié à un organisme')
      }
      if (smallFile.organisme.idRna) {
        // TODO: variable d'environnement pour le hub ASSOCIATION est false => sortir
        stream = await this.hubService.getAssociationFile(smallFile.organisme.idRna, uuid)
      }

      if (smallFile.organisme.idRnf) {
        // TODO: variable d'environnement pour le hub ASSOCIATION est false => sortir
        stream = await this.hubService.getFoundationFile(smallFile.organisme.idRnf, uuid)
      }
    } else {
      stream = await this.s3Service.getStreamedFile(uuid)
    }
    return new Promise((resolve, reject) => {
      stream.on('error', (e) => {
        if (smallFile.storageIn === eFileStorageIn.HUB) {
          this.logger.error('Error while streaming file from HUB')
          this.logger.error(e)
          reject(new NotFoundException('File not found'))
          return
        }
        reject(S3Service.manageS3StreamError(e))
      })
      stream.on('end', resolve)
      stream.pipe(response)
    })
  }
}
