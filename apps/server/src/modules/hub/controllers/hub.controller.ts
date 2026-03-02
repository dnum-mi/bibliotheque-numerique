import { Body, Controller, Get, NotFoundException, Param, Post, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
  IAssociationOutput,
  IFoundationOutput,
  IOrganismeDossier,
  ISiafSearchOrganismeOneOutput,
  Roles,
} from '@biblio-num/shared'

import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { HubService, IHubFileResponse } from '@/modules/hub/providers/hub.service'
import { Stream } from 'stream'
import { HttpHeaders } from '@/shared/constants/http-headers.constants'
import { DownloadMultipleFilesDto } from '../objects/dto/input/download-multiple-files.dto'
import { SearchInputDto } from '../objects/dto/input/search-input.dto'

@ApiTags('HUB')
@Controller('hub')
export class HubController {
  constructor(
    private readonly logger: LoggerService,
    private readonly hubService: HubService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @UsualApiOperation({
    summary: 'Recherche plein text d\'un organisme dans le hub.',
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: Object, // ISiafSearchOrganismeOneOutput
    isArray: true,
  })
  @Post('search')
  @Role(Roles.instructor)
  async searchOrganisme(
    @Body() searchInput: SearchInputDto,
  ): Promise<ISiafSearchOrganismeOneOutput[]> {
    this.logger.verbose('searchOrganisme')
    this.logger.debug(searchInput)
    return this.hubService.searchOrganisme(searchInput)
  }

  @UsualApiOperation({
    summary: 'Rechercher un rna dans le hub.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Object, // IAssociationOutput
  })
  @Get('rna/:rnaId')
  @Role(Roles.instructor)
  async searchRna(
    @Param('rnaId') rna: string,
  ): Promise<IAssociationOutput> {
    this.logger.verbose('searchRna')
    const result = await this.hubService.getAssociation(rna)
    if (!result) {
      throw new NotFoundException(`Aucune association avec cet rna ${rna}`)
    }
    const events = await this.hubService.getEventsAssociation(rna)
    result.events = await this.hubService.setLinkDemarcheAndDossier(events)

    return result
  }

  @UsualApiOperation({
    summary: 'Rechercher un rnf dans le hub.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Object, // IFoundationOutput
  })
  @Get('rnf/:rnfId')
  @Role(Roles.instructor)
  async searchRnf(
    @Param('rnfId') rnf: string,
  ): Promise<IFoundationOutput> {
    this.logger.verbose(`searchRnf ${rnf}`)
    const result = await this.hubService.getFoundation(rnf)
    if (!result) {
      throw new NotFoundException(`Aucune fondation avec cet rnf ${rnf}`)
    }
    const events = await this.hubService.getEventsFoundation(rnf)
    result.events = await this.hubService.setLinkDemarcheAndDossier(events)

    return result
  }

  private async _handleDownloadFile({ data, headers }: IHubFileResponse, response): Promise<void> {
    const headersToCopy = [
      HttpHeaders.CONTENT_TYPE,
      HttpHeaders.CONTENT_DISPOSITION,
      HttpHeaders.CONTENT_LENGTH,
      HttpHeaders.CACHE_CONTROL,
      HttpHeaders.TRANSFER_ENCODING,
    ]
    headersToCopy.forEach((header) => {
      if (headers[header]) {
        response.set(header, headers[header])
      }
    })

    return this._returnStream(data, response)
  }

  private _returnStream(stream: Stream, response): Promise<void> {
    return new Promise((resolve, reject) => {
      stream.on('error', (e) => {
        this.logger.error('Error while streaming file from HUB')
        this.logger.error(e)
        reject(new NotFoundException('File not found'))
      })
      stream.on('end', resolve)
      stream.pipe(response)
    })
  }

  @UsualApiOperation({
    summary: 'Télécharge un fichier d\'une association à partir de son id.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Get('/association/:associationId/file/:fileId')
  @Role(Roles.instructor)
  async downloadAssociationFile(
    @Param('associationId') associationId: string,
    @Param('fileId') fileId: string,
    @Response() response,
  ): Promise<void> {
    this.logger.verbose(`downloadAssociationFile ${associationId} : ${fileId}`)
    const fileResponse = await this.hubService.getAssociationFile(associationId, fileId)

    return this._handleDownloadFile(fileResponse, response)
  }

  @UsualApiOperation({
    summary: 'Télécharge une archive ZIP contenant plusieurs fichiers d\'une association.',
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Post('/association/:associationId/files')
  @Role(Roles.instructor)
  async downloadAssociationMultipleFiles(
    @Param('associationId') associationId: string,
    @Body() dto: DownloadMultipleFilesDto,
    @Response() response,
  ): Promise<void> {
    this.logger.verbose(`downloadAssociationMultipleFiles ${associationId}`)
    const filesResponse = await this.hubService.getAssociationMultipleFiles(associationId, dto.fileIds)

    return this._handleDownloadFile(filesResponse, response)
  }

  @UsualApiOperation({
    summary: 'Télécharge un fichier d\'une fondation à partir de son id.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Get('/foundation/:foundationId/file/:fileId')
  @Role(Roles.instructor)
  async downloadFoundationFile(
    @Param('foundationId') foundationId: string,
    @Param('fileId') fileId: string,
    @Response() response,
  ): Promise<void> {
    this.logger.verbose(`downloadAssociationFile ${foundationId} : ${fileId}`)
    const fileResponse = await this.hubService.getFoundationFile(foundationId, fileId)

    return this._handleDownloadFile(fileResponse, response)
  }

  @UsualApiOperation({
    summary: 'Télécharge une archive ZIP contenant plusieurs fichiers d\'une fondation.',
    method: 'POST',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Post('/foundation/:foundationId/files')
  @Role(Roles.instructor)
  async downloadFoundationMultipleFiles(
    @Param('foundationId') foundationId: string,
    @Body() dto: DownloadMultipleFilesDto,
    @Response() response,
  ): Promise<void> {
    this.logger.verbose(`downloadAssociationMultipleFiles ${foundationId}`)
    const filesResponse = await this.hubService.getFoundationMultipleFiles(foundationId, dto.fileIds)

    return this._handleDownloadFile(filesResponse, response)
  }

   @UsualApiOperation({
     summary: 'Exporter l\'association à partir de son id.',
     method: 'GET',
     minimumRole: Roles.instructor,
     responseType: null,
   })
  @Get('/association/:associationId/export-pdf')
  @Role(Roles.instructor)
  async exportAssociation(
    @Param('associationId') associationId: string,
    @Response() response,
  ): Promise<void> {
    const association = await this.hubService.getAssociation(associationId)
    if (!association) {
      throw new NotFoundException(`Aucune association avec cet rna ${associationId}`)
    }
    const events = await this.hubService.getEventsFoundation(associationId)
    association.events = await this.hubService.setLinkDemarcheAndDossier(events)

    const exportResult = await this.hubService.exportOrganisme(
      association,
    )

    return this._handleDownloadFile(exportResult, response)
  }

  @UsualApiOperation({
    summary: 'Exporter la fondation à partir de son id.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: null,
  })
  @Get('/foundation/:foundationId/export-pdf')
  @Role(Roles.instructor)
   async exportFoundation(
    @Param('foundationId') foundationId: string,
    @Response() response,
   ): Promise<void> {
     const fondation = await this.hubService.getFoundation(foundationId)
     if (!fondation) {
       throw new NotFoundException(`Aucune fondation avec cet rnf ${foundationId}`)
     }
     const events = await this.hubService.getEventsFoundation(foundationId)
     fondation.events = await this.hubService.setLinkDemarcheAndDossier(events)

     const exportResult = await this.hubService.exportOrganisme(
       fondation,
     )
     return this._handleDownloadFile(exportResult, response)
   }

  @UsualApiOperation({
    summary: 'Recupérer liste des dossiers de l\'association.',
    method: 'GET',
    minimumRole: Roles.instructor,
    isArray: true,
    responseType: Object,
  })
  @Get('/association/:associationId/dossiers')
  @Role(Roles.instructor)
  async getAssociationDossiers(
    @Param('associationId') associationId: string,
  ): Promise<IOrganismeDossier[]> {
    const association = await this.hubService.getAssociation(associationId)
    if (!association) {
      throw new NotFoundException(`Aucune association avec cet rna ${associationId}`)
    }

    return this.hubService.getAssociationDossiers(associationId)
  }

  @UsualApiOperation({
    summary: 'Recupérer liste des dossiers de la fondation.',
    method: 'GET',
    minimumRole: Roles.instructor,
    isArray: true,
    responseType: Object,
  })
  @Get('/foundation/:foundationId/dossiers')
  @Role(Roles.instructor)
  async getFoundationDossiers(
    @Param('foundationId') foundationId: string,
  ): Promise<IOrganismeDossier[]> {
    const association = await this.hubService.getFoundation(foundationId)
    if (!association) {
      throw new NotFoundException(`Aucune fondation avec cet rnf ${foundationId}`)
    }

    return this.hubService.getFoundationDossiers(foundationId)
  }
}
