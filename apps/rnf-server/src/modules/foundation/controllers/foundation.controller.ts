import { Body, Controller, ForbiddenException, Get, Param, Post } from "@nestjs/common";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { FoundationService } from "@/modules/foundation/providers/foundation.service";
import { DsService } from "@/modules/ds/providers/ds.service";
import { DsMapperService } from "@/modules/ds/providers/ds-mapper.service";
import { DossierNumberInputDto } from "@/modules/foundation/objects/dto/inputs/dossier-number-input.dto";
import { RnfIdOutputDto } from "@/modules/foundation/objects/dto/outputs/rnf-id-output.dto";
import { GetFoundationInputDto } from "@/modules/foundation/objects/dto/inputs/get-foundation-input.dto";
import { ApiTags } from "@nestjs/swagger";
import { GetFoundationOutputDto } from "@/modules/foundation/objects/dto/outputs/get-foundation-output.dto";

@ApiTags("Foundation")
@Controller("foundation")
export class FoundationController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: FoundationService,
    private readonly dsService: DsService,
    private readonly dsMapperService: DsMapperService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Post("")
  async createFoundation(@Body() dto: DossierNumberInputDto): Promise<RnfIdOutputDto> {
    this.logger.verbose("createNewFoundation");
    const rawDossier = await this.dsService.getOneDossier(dto.dossierId);
    const instructeurId = rawDossier.instructeurs?.find((i) => i.email === dto.email)?.id;
    if (!instructeurId) {
      throw new ForbiddenException("This instructeur's email is not linked to this dossier.");
    }
    const createDto = this.dsMapperService.mapDossierToFoundation(rawDossier);
    const foundation = await this.service.CreateFoundation(createDto, dto.forceCreate);
    await this.dsService.writeRnfIdInPrivateAnnotation(rawDossier.id!, instructeurId, foundation.type, foundation.rnfId);
    // TODO: await this.foundationHistoryService.newHistoryEntry(foundation, dto);
    return { rnfId: foundation.rnfId };
  }

  @Get(`/:rnfId`)
  async getFoundation(@Param() params: GetFoundationInputDto): Promise<GetFoundationOutputDto> {
    this.logger.verbose("getFoundation");
    return this.service.getOneFoundation(params.rnfId);
  }
}
