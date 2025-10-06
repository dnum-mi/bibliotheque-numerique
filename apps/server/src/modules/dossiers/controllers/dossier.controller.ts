import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DossierService } from '../providers/dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { IRole, Roles } from '@biblio-num/shared'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncOneDossierJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { DossierWithFieldsOutputDto } from '../objects/dto/dossier-with-fields-output.dto'

@ApiTags('Dossiers')
@Controller('dossiers')
export class DossierController {
  constructor(
    private readonly dossiersService: DossierService,
    private readonly logger: LoggerService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get(':id')
  @UsualApiOperation({
    summary: 'Retourner un dossier.',
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: Dossier,
  })
  @Role(Roles.instructor)
  async findOne(
    @CurrentUserRole() role: IRole,
    @Param('id') id: string,
  ): Promise<Dossier> {
    this.logger.verbose('findone')
    const { dossier, hasFullAccess } = await this.dossiersService.getAndValidateDossierForRole(
      Number(id),
      role,
    )
    const dossierWithFiles = this.dossiersService.mapDossierWithFiles(
      dossier,
      hasFullAccess,
    )

    return dossierWithFiles
  }

  @Get(':id/fields')
  @UsualApiOperation({
    summary: "Retourner les champs d'un dossier.",
    method: 'GET',
    minimumRole: Roles.instructor,
    responseType: DossierWithFieldsOutputDto,
  })
  @Role(Roles.instructor)
  async findFieldsFromOne(
    @CurrentUserRole() role: IRole,
    @Param('id') id: string,
  ): Promise<DossierWithFieldsOutputDto> {
    this.logger.verbose('findFieldsFromOne')
    const { dossier, hasFullAccess } = await this.dossiersService.getAndValidateDossierForRole(
      Number(id),
      role,
    )
    const dossierResult = await this.dossiersService.mapDossierToFieldsOutput(
      dossier,
      hasFullAccess,
    )

    return dossierResult
  }

  @Patch(':id/sync')
  @UsualApiOperation({
    summary: "Force la synchronisation d'un dossier.",
    method: 'PATCH',
    minimumRole: Roles.sudo,
    responseType: null,
  })
  @Role(Roles.sudo)
  async synchroniseOne(@Param('id') id: string): Promise<void> {
    this.logger.verbose('synchroniseOne')
    const smallDoss = await this.dossiersService.repository.findOne({
      where: { id: Number(id) },
      relations: ['demarche'],
      select: {
        id: true,
        dsDataJson: { number: true },
        demarche: { id: true },
      },
    })
    if (!smallDoss) {
      throw new NotFoundException('Dossier not found')
    }
    await this.syncQueue.add(eJobName.SyncOneDossier, {
      demarcheId: smallDoss.demarche.id,
      dsDossierId: smallDoss.dsDataJson.number,
      fromScratch: true,
    } as SyncOneDossierJobPayload)
  }
}
