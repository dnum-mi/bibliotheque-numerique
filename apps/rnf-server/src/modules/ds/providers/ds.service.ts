import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Dossier, DossierModifierAnnotationTextInput, DsApiClient } from "@dnum-mi/ds-api-client";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { FoundationType } from "@prisma/client";

@Injectable()
export class DsService {
  private dsApiClient: DsApiClient;
  private annotationFDDId: string;
  private annotationFEId: string;

  constructor(private config: ConfigService, private logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
    const api: string | undefined = this.config.get("ds.api");
    const token: string | undefined = this.config.get("ds.token");
    this.annotationFDDId = this.config.get("ds.annotationFDDId")!;
    this.annotationFEId = this.config.get("ds.annotationFEId")!;
    if (!api || !token) {
      throw new Error("DS API not configured. Check your env.");
    } else if (!this.annotationFEId || !this.annotationFDDId) {
      throw new Error("RNG Annotation's ids are not configured. Check your env.");
    } else {
      this.dsApiClient = new DsApiClient(api, token);
      this.logger.debug(`DS API Client configured with: \n   api = ${api}\n   token =${token}`);
    }
  }

  private _giveAnnotationId(ft: FoundationType) {
    switch (ft) {
      case FoundationType.FE:
        return this.annotationFEId;
      case FoundationType.FDD:
        return this.annotationFDDId;
      case FoundationType.FRUP: //TODO:
        return "someId";
    }
  }

  async writeRnfIdInPrivateAnnotation(
    dossierGraphQlId: string,
    instructeurId: string,
    foundationType: FoundationType,
    rnfId: string,
  ): Promise<void> {
    this.logger.verbose("writeRnfIdInPrivateAnnotation");
    const input: DossierModifierAnnotationTextInput = {
      dossierId: dossierGraphQlId,
      instructeurId,
      annotationId: this._giveAnnotationId(foundationType),
      value: rnfId,
    };
    this.logger.debug("input: " + JSON.stringify(input));
    return this.dsApiClient.writeInPrivateAnnotation(input).then((response: boolean) => {
      if (!response) {
        throw new Error("DS API error, could not update value for unknown reason.");
      } else {
        this.logger.log("private annotation field has been updated on DS API.");
      }
    });
  }

  async getOneDossier(idDossier: number): Promise<Partial<Dossier>> {
    this.logger.verbose("getOneDossier");
    return this.dsApiClient.dossier(idDossier).then((response: { dossier: Partial<Dossier> }) => {
      this.logger.debug("DS API response: " + JSON.stringify(response.dossier));
      return response.dossier;
    });
  }
}
