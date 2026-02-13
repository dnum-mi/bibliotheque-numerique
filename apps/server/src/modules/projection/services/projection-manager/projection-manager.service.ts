import { Injectable } from '@nestjs/common'
import { DossierProjectionService } from '@/modules/projection/services/dossier-projection/dossier-projection.service'
import { FieldProjectionService } from '@/modules/projection/services/field-projection/field-projection.service'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class ProjectionManagerService {
  constructor(
    private readonly logger: LoggerService,
    private readonly dossierProjection: DossierProjectionService,
    private readonly fieldProjection: FieldProjectionService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async rebuildProjectionTables(demarche: Demarche): Promise<void> {
    // TODO:
    // await this.dossierProjection.rebuild(demarche)
    await this.fieldProjection.rebuild(demarche)
  }

  async upsertDossierInProjections(
    demarche: Demarche,
    dossierId: number,
  ): Promise<void> {
    this.logger.verbose('upsertDossierProjection')
    await this.fieldProjection.upsertOneDossier(demarche, dossierId)
    // TODO
    // await this.dossierProjection.upsertOneDossier(demarche, dossier)
  }
}
