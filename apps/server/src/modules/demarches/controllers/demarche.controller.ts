import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/services/demarche.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../objects/entities/demarche.entity'
import { DemarcheSynchroniseService } from '../providers/services/demarche-synchronise.service'
import { User } from '../../users/entities/user.entity'
import {
  DemarcheOutputDto,
  demarcheOutputDtoKeys,
} from '@/modules/demarches/objects/dtos/demarche-output.dto'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import { SmallDemarcheOutputDto, CreateDemarcheDto, Roles } from '@biblio-num/shared'
import { UpdateDemarcheDto } from '@/modules/demarches/objects/dtos/update-demarche.dto'
import { Role } from '@/modules/users/providers/decorators/role.decorator'

@ApiTags('Demarches')
@Controller('demarches')
export class DemarcheController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get('small')
  @Role(Roles.superadmin) // TODO: role - filter with options
  async allSmallDemarche(): Promise<SmallDemarcheOutputDto[]> {
    this.logger.verbose('allSmallDemarche')
    return this.demarcheService.repository
      .find({ select: ['id', 'title', 'dsDataJson', 'types'] })
      .then((demarches) => {
        return demarches.map((d) => ({
          id: d.id,
          title: d.title,
          types: d.types,
          dsId: d.dsDataJson?.number,
        }))
      })
  }

  @Get()
  @Role(Roles.superadmin) // TODO: role - filter with options
  async getDemarches(@CurrentUser() user: User): Promise<Demarche[]> {
    this.logger.verbose('getDemarches')
    return this.demarcheService.findWithPermissions(user)
  }

  @Get(':id')
  @Role(Roles.superadmin) // TODO: role - filter with options
  async getDemarcheById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DemarcheOutputDto> {
    this.logger.verbose('getDemarcheById')
    // eslint-disable-next-line
    // @ts-ignore TODO: role refacto
    // const ruleIds = this.demarcheService.getRulesFromUserPermissions(req.user)
    // if (
    //   ruleIds &&
    //   ruleIds.length > 0 &&
    //   !ruleIds.find((ruleId) => ruleId === id)
    // ) {
    //   throw new HttpException(
    //     `Not authorized access for demarche id: ${id}`,
    //     HttpStatus.FORBIDDEN,
    //   )
    // }

    return this.demarcheService.findOneOrThrow({
      where: { id },
      select: demarcheOutputDtoKeys,
    })
  }

  @Post('create')
  @Role(Roles.sudo)
  async create(@Body() dto: CreateDemarcheDto): Promise<{ message: string }> {
    this.logger.verbose('create')
    await this.demarcheSynchroniseService.createAndSynchronise(
      dto.idDs,
      dto.identification,
    )
    return { message: `Demarche with DS id ${dto.idDs} has been created.` }
  }

  @Post('synchro-dossiers')
  @Role(Roles.sudo)
  async synchroDossiers(
    @Body('idDs', ParseIntPipe) idDs: number,
  ): Promise<{ message: string }> {
    this.logger.verbose('synchroDossiers')
    await this.demarcheSynchroniseService.synchroniseOneDemarche(idDs, true)
    return { message: `Demarche with DS id ${idDs} has been synchronised.` }
  }

  @Patch(':id')
  @Role(Roles.sudo)
  async updateIdentification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDemarcheDto,
  ): Promise<{ message: string }> {
    this.logger.verbose(`update identification of demarche ${id}`)
    await this.demarcheService.updateDemarche(id, dto)
    if (!Object.keys(dto).length) {
      throw new BadRequestException('Identification and types are undefined')
    }
    return {
      message: `Demarche of id ${id} has been update with identification ${dto.identification} and types ${dto.types}.`,
    }
  }
}
