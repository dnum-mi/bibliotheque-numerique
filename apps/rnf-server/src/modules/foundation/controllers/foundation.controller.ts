import { Body, Controller, ForbiddenException, Get, Param, Post, Query } from "@nestjs/common";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { FoundationService } from "@/modules/foundation/providers/foundation.service";
import { DsService } from "@/modules/ds/providers/ds.service";
import { DsMapperService } from "@/modules/ds/providers/ds-mapper.service";
import { DossierNumberInputDto } from "@/modules/foundation/objects/dto/inputs/dossier-number-input.dto";
import { RnfIdOutputDto } from "@/modules/foundation/objects/dto/outputs/rnf-id-output.dto";
import { GetFoundationInputDto } from "@/modules/foundation/objects/dto/inputs/get-foundation-input.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetFoundationOutputDto } from "@/modules/foundation/objects/dto/outputs/get-foundation-output.dto";
import { InfoDSOutputDto } from "../objects/dto/info-ds-output.dto";
import { GetFoundationsInputDto } from "../objects/dto/inputs/get-foundations-inputs.dto";

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
  @ApiOperation({ summary: "Créer une fondation." })
  async createFoundation(@Body() dto: DossierNumberInputDto): Promise<RnfIdOutputDto> {
    this.logger.verbose("createNewFoundation");
    const rawDossier = await this.dsService.getOneDossier(dto.dossierId);
    const instructeurId = rawDossier.instructeurs?.find((i) => i.email === dto.email)?.id;
    if (!instructeurId) {
      throw new ForbiddenException("This instructeur's email is not linked to this dossier.");
    }
    const createDto = this.dsMapperService.mapDossierToFoundation(rawDossier);

    const ds: InfoDSOutputDto = {
      demarcheId: rawDossier.demarche?.number,
      dossierId: rawDossier.number,
    };

    const foundation = await this.service.CreateFoundation(createDto, ds, dto.forceCreate);
    await this.dsService.writeRnfIdInPrivateAnnotation(rawDossier.id!, instructeurId, foundation.type, foundation.rnfId);
    // TODO: await this.foundationHistoryService.newHistoryEntry(foundation, dto);
    return { rnfId: foundation.rnfId, ds };
  }

  @Get(`/:rnfId`)
  @ApiOperation({ summary: "Rechercher la fondation par le numéro." })
  async getFoundation(@Param() params: GetFoundationInputDto): Promise<GetFoundationOutputDto> {
    this.logger.verbose("getFoundation");
    return this.service.getOneFoundation(params.rnfId);
  }

  @Get("/findByIdsAndDate")
  @ApiOperation({ summary: "Rechercher les fondations par le numéro et la date." })
  async getFoundations(@Query() query: GetFoundationsInputDto): Promise<GetFoundationOutputDto[]> {
    this.logger.verbose("getFoundations");

    return this.service.getFoundationsByRnfIds(query.rnfIds, query.date);
  }
}
