import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { FoundationService } from '@/modules/foundation/providers/foundation.service'
import { DsService } from '@/modules/ds/providers/ds.service'
import { DsMapperService } from '@/modules/ds/providers/ds-mapper.service'
import { DossierNumberInputDto } from '@/modules/foundation/objects/dto/inputs/dossier-number-input.dto'
import { RnfIdOutputDto } from '@/modules/foundation/objects/dto/outputs/rnf-id-output.dto'
import { GetFoundationInputDto } from '@/modules/foundation/objects/dto/inputs/get-foundation-input.dto'
import { ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { InfoDSOutputDto } from '../objects/dto/info-ds-output.dto'
import { GetFoundationsInputDto } from '../objects/dto/inputs/get-foundations-inputs.dto'
import { FoundationOutputDto } from '@/modules/foundation/objects/dto/outputs/foundation-output.dto'

@ApiTags('Foundation')
@Controller('foundations')
export class FoundationController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: FoundationService,
    private readonly dsService: DsService,
    private readonly dsMapperService: DsMapperService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post('')
  // TODO: this route should be white listed for RNF FRONT
  @ApiOperation({ summary: 'Créer une fondation.' })

  @ApiConflictResponse({
    description: 'Une ou des fondations similaires ont été trouvées.',
  })
  async createFoundation(
    @Body() dto: DossierNumberInputDto,
  ): Promise<RnfIdOutputDto> {
    this.logger.verbose('createNewFoundation')
    const rawDossier = await this.dsService.getOneDossier(dto.dossierId)
    const instructeurId = rawDossier.instructeurs.find(
      (i) => i.email === dto.email,
    )?.id

    if (!instructeurId) {
      throw new ForbiddenException(
        "This instructeur's email is not linked to this dossier.",
      )
    }
    const createDto = this.dsMapperService.mapDossierToDto(rawDossier)

    const ds: InfoDSOutputDto = {
      demarcheId: rawDossier.demarche.number,
      dossierId: rawDossier.number,
    }

    const foundation = await this.service.createFoundation(
      createDto,
      ds,
      dto.forceCreate,
    )
    await this.dsService.writeRnfIdInPrivateAnnotation(
      rawDossier.id,
      instructeurId,
      foundation.rnfId,
      ds,
    )
    return { rnfId: foundation.rnfId, ds }
  }

  // TODO: this route should be white listed for DS
  @Get('/:rnfId')
  @ApiOperation({
    summary: 'Retourner la fondation correspondant au numéro RNF.',
  })
  async getFoundation(
    @Param() params: GetFoundationInputDto,
  ): Promise<FoundationOutputDto> {
    this.logger.verbose('getFoundation')
    return this.service.getOneFoundation(params.rnfId)
  }

  // TODO: this route should be white listed for BNUM
  @Post('/last-updated-list')
  @HttpCode(200)
  @ApiOperation({
    summary: "Recevoir l'ensemble des fondations modifiées depuis X.",
    description:
      'Cette route est conceptuellement un GET,' +
      " mais nous utilisons un post pour ne pas être limité sur le nombre d'id demandé en input à travers l'url.",
  })
  async getUpdatedFoundations(
    @Body() body: GetFoundationsInputDto,
  ): Promise<string[]> {
    this.logger.verbose('getUpdatedFoundations')
    return this.service.getLastUpdatedFoundations(
      body.rnfIds,
      body.lastUpdatedAt,
    )
  }
}
