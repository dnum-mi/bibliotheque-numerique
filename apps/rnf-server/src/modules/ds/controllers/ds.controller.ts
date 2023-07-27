import { Controller, Get } from "@nestjs/common";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { GetDsUrlOutputDto } from "@/modules/ds/objects/dto/get-ds-url-output.dto";

@ApiTags("Ds")
@Controller("ds")
export class DsController {
  dsHost: string;

  constructor(private readonly logger: LoggerService, private readonly config: ConfigService) {
    this.logger.setContext(this.constructor.name);
    const host = this.config.get("ds.host");
    if (!host) {
      throw new Error("ds host is not defined in env.");
    }
    this.dsHost = host;
  }

  @Get(`/url`)
  @ApiOperation({ summary: "Récupérer l'url de Démarches simplifiées." })
  getDsUrl(): GetDsUrlOutputDto {
    this.logger.verbose("getDsUrl");
    return {
      url: this.dsHost,
    };
  }
}
