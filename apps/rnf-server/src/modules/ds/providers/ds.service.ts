import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Dossier, DsApiClient } from "@dnum-mi/ds-api-client";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";

@Injectable()
export class DsService {
  private dsApiClient: DsApiClient;

  constructor(private config: ConfigService, private logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
    const api: string | undefined = this.config.get("ds.api");
    const token: string | undefined = this.config.get("ds.token");
    if (!api || !token) {
      throw new Error("DS API not configured. Check your env");
    } else {
      this.dsApiClient = new DsApiClient(api, token);
      this.logger.debug(`DS API Client configured with: \n   api = ${api}\n   token =${token}`);
    }
  }

  async getOneDossier(idDossier: number): Promise<Partial<Dossier>> {
    this.logger.verbose("getOneDossier");
    return this.dsApiClient.dossier(idDossier).then((response: { dossier: Partial<Dossier> }) => {
      this.logger.debug("DS API response: " + JSON.stringify(response.dossier));
      return response.dossier;
    });
  }
}
