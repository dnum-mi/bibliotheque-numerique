import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { Champ, CustomChamp, DossierWithCustomChamp } from '@dnum-mi/ds-api-client'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { personMapper } from '@/modules/ds/objects/mappers/person.mapper'
import { CreatePersonInFoundationDto } from '@/modules/foundation/objects/dto/create-person-in-foundation.dto'
import { CreatePersonDto } from '@/modules/person/objects/dto/create-person.dto'
import { FoundationRole } from '@prisma/client'
import { TypeDeChamp } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import { RawChamp } from '@/modules/ds/objects/types/raw-champ.type'

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
  ): Record<string, Champ> {
    const champsHash = {}
    for (const champ of champs) {
      for (const key in regexHash) {
        if (champ.champDescriptor.description?.match(regexHash[key])) {
          if (champ.champDescriptor.type === TypeDeChamp.Repetition) {
            const rawChamp = champ as unknown as RawChamp
            champsHash[key] = {
              rows: rawChamp.rows.map((subChamp: {
                champs: RawChamp[]
              }) => this.findChampsInDossier(subChamp.champs, this.dsConfigurationService.rnfFieldKeys)),
            } as unknown as Champ
          } else {
            champsHash[key] = champ
          }
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

    const champsHash =
      this.findChampsInDossier(rawDossier.champs, this.dsConfigurationService.rnfFieldKeys)

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

  mapPersonInFoundationToDto(champsHash: Record<string, Champ>, mapper: Mapper): CreatePersonInFoundationDto[] {
    this.logger.verbose('mapPersonInFoundationToDto')

    const personInFoundationDto: CreatePersonInFoundationDto[] = []
    if (!champsHash.personFirstName) {
      return personInFoundationDto
    }

    // Declarant
    const declarant: CreatePersonDto = this.mapPersonToDto(champsHash, mapper)
    personInFoundationDto.push({ person: declarant, role: FoundationRole.DECLARANT })

    // Administrators
    if (!champsHash.personAdministrator) {
      return personInFoundationDto
    }
    const administratorsChamps: {champs: RawChamp[]}[] =
      (champsHash.personAdministrator as unknown as RawChamp).rows ?? []
    if (administratorsChamps.length > 0) {
      administratorsChamps.forEach((administrator) => {
        const admin: CreatePersonDto = this.mapPersonToDto(administrator as unknown as Record<string, Champ>, mapper)
        admin[personMapper.personPhone] = ''
        personInFoundationDto.push({
          person: admin,
          role: FoundationRole.ADMIN,
        })
      })
    }

    return personInFoundationDto
  }

  mapPersonToDto(champsHash: Record<string, Champ>, mapper: Mapper): CreatePersonDto {
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

    return personDto
  }
}
