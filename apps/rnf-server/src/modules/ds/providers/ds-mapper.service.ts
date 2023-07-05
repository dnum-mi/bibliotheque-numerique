import { BadRequestException, Injectable } from "@nestjs/common";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { Dossier } from "@dnum-mi/ds-api-client";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";
import { Mapper } from "@/modules/ds/objects/types/mapper.type";
import { DotationFoundationMapper } from "@/modules/ds/objects/mappers/dotation-foundation.mapper";
import { EntrepriseFoundationMapper } from "@/modules/ds/objects/mappers/entreprise-foundation.mapper";
import { DemandeNumeroRnfMapper } from "@/modules/ds/objects/mappers/demande-numero-rnf.mapper";
import { ChampHash } from "@/modules/ds/objects/types/champ-hash.type";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DsMapperService {
  private mappers: Record<string, Mapper<CreateFoundationDto>>;

  constructor(private logger: LoggerService, private conf: ConfigService) {
    this.logger.setContext(this.constructor.name);
    this._initMappers();
  }

  // TODO: find a way to load it from config, or s3, or something that doesnt need to push code to change it
  private _initMappers() {
    this.logger.verbose(`_initMappers`);
    if (!this.conf.get("ds.demarcheFDDId") || !this.conf.get("ds.demarcheFEId")) {
      throw new Error("The id of the demarche dotation and entreprise are not set. Check your env.");
    }
    this.mappers = {
      [this.conf.get("ds.demarcheFDDId")]: DotationFoundationMapper,
      [this.conf.get("ds.demarcheFEId")]: EntrepriseFoundationMapper,
      [this.conf.get("ds.demarcheDNRId")]: DemandeNumeroRnfMapper,
    };
  }

  mapDossierToFoundation(rawDossier: Partial<Dossier>): CreateFoundationDto {
    this.logger.verbose(`mapDossierToFoundation`);
    if (!rawDossier.champs?.length) {
      throw new BadRequestException("Dossier champs is empty.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const demarcheId = rawDossier.demarche?.number?.toString() ?? "!Pas d'id de demarche !";
    const mapper = this.mappers[demarcheId];
    if (!mapper) {
      throw new BadRequestException("This demarche id is not implemented");
    }
    this.logger.debug("starting mapping");
    const champsHash: ChampHash = Object.fromEntries(rawDossier.champs.map((champ) => [champ.label, champ]));
    return Object.fromEntries(
      Object.entries(mapper).map(([key, fn]) => {
        const value = fn(champsHash);
        this.logger.debug(`adding key ${key} with value ${value}`);
        return [key, value];
      }),
    ) as unknown as CreateFoundationDto;
  }
}
