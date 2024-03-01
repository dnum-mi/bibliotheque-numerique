import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { DemarcheService } from '../providers/services/demarche.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../objects/entities/demarche.entity'
import { DemarcheSynchroniseService } from '../providers/services/demarche-synchronise.service'
import {
  DemarcheOutputDto,
} from '@/modules/demarches/objects/dtos/demarche-output.dto'

import {
  IRole,
  Roles,
} from '@biblio-num/shared'

import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { CurrentDemarcheInterceptor } from '@/modules/demarches/providers/interceptors/current-demarche.interceptor'
import { CurrentDemarche } from '@/modules/demarches/providers/decorators/current-demarche.decorator'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncOneDemarcheJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'
import { CreateDemarcheDto } from '@/modules/demarches/objects/dtos/create-demarche.dto'
import { UpdateDemarcheDto } from '@/modules/demarches/objects/dtos/update-demarche.dto'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'

@ApiTags('Demarches')
@Controller('demarches')
export class DemarcheController {
  constructor(
    private readonly demarcheService: DemarcheService,
    private readonly demarcheSynchroniseService: DemarcheSynchroniseService,
    private readonly dossierService: DossierService,
    private readonly logger: LoggerService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
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
      dto.types,
    )
    return { message: `Demarche with DS id ${dto.idDs} has been created.` }
  }

  @Put(':demarcheId/sync')
  @Role(Roles.sudo)
  async syncOneDemarcheFromScratch(
    @Param('demarcheId', ParseIntPipe) demarcheId: number,
  ): Promise<void> {
    this.logger.verbose('syncOneDemarcheFromScratch')
    this.logger.debug('Adding SyncOneDemarche job in queue')
    await this.syncQueue.add(eJobName.SyncOneDemarche, {
      demarcheId,
      fromScratch: true,
    } as SyncOneDemarcheJobPayload)
  }

  @Patch(':demarcheId')
  @Role(Roles.sudo)
  async updateIdentification(
    @Param('demarcheId', ParseIntPipe) id: number,
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

  @Patch(':demarcheId/soft-delete')
  @Role(Roles.sudo)
  async softDeleteDemarche(
    @Param('demarcheId', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    this.logger.verbose(`soft delete demarche ${id}`)
    await this.dossierService.softDeleteDemarcheDossiers(id)
    await this.demarcheService.softDeleteDemarche(id)
    return {
      message: `Demarche of id ${id} has been soft deleted.`,
    }
  }
}
