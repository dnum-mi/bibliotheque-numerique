import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { CustomChamp, DossierWithCustomChamp } from '@dnum-mi/ds-api-client'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'

@Injectable()
export class DsMapperService {
  constructor(
    private readonly logger: LoggerService,
    private readonly dsConfigurationService: DsConfigurationService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  public findChampsInDossier(
    champs: CustomChamp[],
    regexHash: Record<string, RegExp>,
  ): Record<string, CustomChamp> {
    const champsHash = {}
    for (const champ of champs) {
      for (const key in regexHash) {
        if (champ.champDescriptor.description?.match(regexHash[key])) {
          champsHash[key] = champ
        }
      }
    }
    return champsHash
  }

  mapDossierToDto(rawDossier: DossierWithCustomChamp, mapper?: Mapper): CreateFoundationDto {
    this.logger.verbose('mapDossierToFoundation')
    if (!rawDossier.champs.length) {
      throw new BadRequestException('Dossier champs is empty.')
    }
    if (!mapper) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const demarcheId = rawDossier.demarche.number?.toString() ?? '!no-id!'
      mapper = this.dsConfigurationService.getMapperFromDemarcheDsId(demarcheId)
    }
    const champsHash = this.findChampsInDossier(rawDossier.champs, this.dsConfigurationService.rnfFieldKeys)
    return Object.fromEntries(
      Object.keys(mapper).map((key) => [key, (mapper!)[key](champsHash[key])])
        .filter(([key, value]) => !!value),
    ) as unknown as CreateFoundationDto
  }
}
