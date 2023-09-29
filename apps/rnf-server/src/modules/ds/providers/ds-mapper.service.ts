import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { CustomChamp, DossierWithCustomChamp } from '@dnum-mi/ds-api-client'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { personMapper } from '@/modules/ds/objects/mappers/person.mapper'
import { CreatePersonInFoundationDto } from '@/modules/foundation/objects/dto/create-person-in-foundation.dto'
import { CreatePersonDto } from '@/modules/person/objects/dto/create-person.dto'
import { FoundationRole } from '@prisma/client'

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

    const mapperWithOutPerson = this.mapperWithOutPerson(mapper)
    const foudationDto: CreateFoundationDto = Object.fromEntries(
      Object.keys(mapperWithOutPerson)
        .map((key) => [key, (mapperWithOutPerson)[key](champsHash[key])] as [string, string])
        .filter(([key, value]) => !!value),
    ) as unknown as CreateFoundationDto

    foudationDto.personInFoundationToCreate = this.mapPersonInFoundationToDto(champsHash, mapper)

    return foudationDto
  }

  mapperWithOutPerson(mapper: Mapper): Mapper {
    const mapperWithOutPerson = { ...mapper }
    for (const key in personMapper) {
      delete mapperWithOutPerson[key]
    }
    return mapperWithOutPerson
  }

  mapPersonInFoundationToDto(champsHash: Record<string, CustomChamp>, mapper: Mapper): CreatePersonInFoundationDto[] {
    this.logger.verbose('mapPersonInFoundationToDto')

    const personInFoundationDto: CreatePersonInFoundationDto[] = []

    // Declarant
    const declarant: CreatePersonDto = this.mapPersonToDto(champsHash, mapper)
    const roles = FoundationRole.DECLARANT
    personInFoundationDto.push({ person: declarant, role: roles })

    // Administrators
    // const administrators: PersonMapper[] = this.dsConfigurationService.getAdministratorsFromDemarcheDsId('!no-id!')
    console.log(champsHash)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

    return personInFoundationDto
  }

  mapPersonToDto(champsHash: Record<string, CustomChamp>, mapper: Mapper): CreatePersonDto {
    this.logger.verbose('mapPersonToDto')

    const personDto: CreatePersonDto = Object.fromEntries(
      Object.keys(personMapper).map((key) => [personMapper[key], (mapper)[key](champsHash[key])] as [string, string])
        .filter(([key, value]) => !!value),
    ) as unknown as CreatePersonDto

    personDto.bornAt = new Date(personDto.bornAt)

    // Todo: How to mapper this with role?
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete personDto.quality

    // Todo: Add civility in entity
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete personDto.civility

    return personDto
  }
}
