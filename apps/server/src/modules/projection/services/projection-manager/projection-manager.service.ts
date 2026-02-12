import { Injectable } from '@nestjs/common'
import { DossierProjectionService } from '@/modules/projection/services/dossier-projection/dossier-projection.service'
import { FieldProjectionService } from '@/modules/projection/services/field-projection/field-projection.service'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

@Injectable()
export class ProjectionManagerService {
  constructor(
    private readonly dossierProjection: DossierProjectionService,
    private readonly fieldProjection: FieldProjectionService,
  ) {}

  async ensureProjectionTables(demarche: Demarche): Promise<void> {
    // TODO
    throw new Error('ensureProjectionTables not implemented')
  }

  async rebuildProjectionTables(demarche: Demarche): Promise<void> {
    // TODO
    throw new Error('rebuildProjection not implemented')
  }

  async upsertDossierProjection(
    demarche: Demarche,
    dossier: Dossier,
  ): Promise<void> {
    // TODO
    throw new Error('upsertDossierProjection not implemented')
  }
}
