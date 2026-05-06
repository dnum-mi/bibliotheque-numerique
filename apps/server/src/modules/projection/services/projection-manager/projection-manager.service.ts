import { Injectable } from '@nestjs/common'
import { DossierProjectionService } from '@/modules/projection/services/dossier-projection/dossier-projection.service'
import { FieldProjectionService } from '@/modules/projection/services/field-projection/field-projection.service'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class ProjectionManagerService {
  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(Demarche)
    private demarcheRepository: Repository<Demarche>,
    private readonly dataSource: DataSource,
    private readonly dossierProjection: DossierProjectionService,
    private readonly fieldProjection: FieldProjectionService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  static buildFieldTableName(demarcheId: number): string {
    return `projection-field-${demarcheId}`
  }

  static buildDossierTableName(demarcheId: number): string {
    return `projection-dossier-${demarcheId}`
  }

  private async _doesTableExists(name: string): Promise<boolean> {
    return this.dataSource.query('SELECT to_regclass($1) as exists', [`public.${name}`])
      .then(a => !!a?.[0].exists)
  }

  public async buildTablesForOneDemarche(demarche: Demarche, force = false): Promise<void> {
    this.logger.verbose('buildTablesForOneDemarche')
    const fieldTableName = ProjectionManagerService.buildFieldTableName(demarche.id)
    const dossierTableName = ProjectionManagerService.buildDossierTableName(demarche.id)
    if (!(await this._doesTableExists(fieldTableName)) || force) {
      this.logger.log(`Building field projection table (${demarche.title})`)
      await this.fieldProjection.rebuild(demarche)
    }
    if (!(await this._doesTableExists(dossierTableName)) || force) {
      this.logger.log(`Building dossier projection table (${demarche.title})`)
      await this.dossierProjection.rebuild(demarche)
    }
  }

  // ensure all demarche have their projection table already
  async InitFirsTime(force: boolean): Promise<void> {
    this.logger.log('InitFirsTime: Ensuring projection tables exist')
    const demarches = await this.demarcheRepository.find()
    for (const demarche of demarches) {
      await this.buildTablesForOneDemarche(demarche, force)
    }

    this.logger.log('✅ Projection tables are all presents')
  }

  async upsertDossierInProjections(
    demarche: Demarche,
    dossierId: number,
  ): Promise<void> {
    this.logger.verbose('upsertDossierProjection')
    await this.fieldProjection.upsertOneDossier(demarche, dossierId)
    await this.dossierProjection.upsertOneDossier(demarche, dossierId)
  }

  async dropTablesForOneDemarche(demarcheId: number): Promise<void> {
    this.logger.warn(`Dropping projection tables for demarche ${demarcheId}`)

    const fieldTableName = ProjectionManagerService.buildFieldTableName(demarcheId)
    const dossierTableName = ProjectionManagerService.buildDossierTableName(demarcheId)

    const query = `
      DROP TABLE IF EXISTS "${fieldTableName}" CASCADE;
      DROP TABLE IF EXISTS "${dossierTableName}" CASCADE;
    `

    await this.dataSource.query(query)

    this.logger.log(`Projection tables for demarche ${demarcheId} dropped.`)
  }
}
