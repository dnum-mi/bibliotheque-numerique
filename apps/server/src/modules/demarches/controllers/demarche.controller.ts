import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DemarcheService } from '../providers/services/demarche.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../objects/entities/demarche.entity'
import { DemarcheSynchroniseService } from '../providers/services/demarche-synchronise.service'
import {
  DemarcheOutputDto,
} from '@/modules/demarches/objects/dtos/demarche-output.dto'
import { SmallDemarcheOutputDto, CreateDemarcheDto, Roles, IRole } from '@biblio-num/shared'
import { UpdateDemarcheDto } from '@/modules/demarches/objects/dtos/update-demarche.dto'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { CurrentDemarcheInterceptor } from '@/modules/demarches/providers/interceptors/current-demarche.interceptor'
import { CurrentDemarche } from '@/modules/demarches/providers/decorators/current-demarche.decorator'

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
  @Role(Roles.instructor)
  async allSmallDemarche(@CurrentUserRole() role: IRole): Promise<SmallDemarcheOutputDto[]> {
    this.logger.verbose('allSmallDemarche')
    return this.demarcheService.findMultipleSmallDemarche({}, role)
  }

  @Get()
  @Role(Roles.instructor)
  async getDemarches(@CurrentUserRole() role: IRole): Promise<Demarche[]> {
    this.logger.verbose('getDemarches')
    return this.demarcheService.findMultipleDemarche({}, role)
  }

  @Get(':demarcheId')
  @Role(Roles.instructor)
  @UseInterceptors(CurrentDemarcheInterceptor)
  async getDemarcheById(
    @CurrentDemarche() demarche: Demarche,
  ): Promise<DemarcheOutputDto> {
    this.logger.verbose('getDemarcheById')
    return demarche
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
