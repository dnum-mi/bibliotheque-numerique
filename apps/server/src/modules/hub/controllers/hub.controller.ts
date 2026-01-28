import { Controller, Get, NotFoundException, Param, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
  IAssociationOutput,
  IFoundationOutput,
  ISiafSearchOrganismeOneOutput,
  Roles,
} from '@biblio-num/shared'

import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { HubService } from '@/modules/hub/providers/hub.service'
import { Stream } from 'stream'

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
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Object, // ISiafSearchOrganismeOneOutput
    isArray: true,
  })
  @Get('search/:sentence')
  @Role(Roles.instructor)
  async searchOrganisme(
    @Param('sentence') sentence: string,
  ): Promise<ISiafSearchOrganismeOneOutput[]> {
    this.logger.verbose('searchOrganisme')
    return this.hubService.searchOrganisme(sentence)
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
    this.logger.verbose('searchRnf')
    const result = await this.hubService.getFoundation(rnf)
    if (!result) {
      throw new NotFoundException(`Aucune fondation avec cet rnf ${rnf}`)
    }
    const events = await this.hubService.getEventsFoundation(rnf)
    result.events = await this.hubService.setLinkDemarcheAndDossier(events)

    return result
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
    const stream = await this.hubService.getAssociationFile(associationId, fileId)
    return this._returnStream(stream, response)
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
    const stream = await this.hubService.getFoundationFile(foundationId, fileId)
    return this._returnStream(stream, response)
  }
}
