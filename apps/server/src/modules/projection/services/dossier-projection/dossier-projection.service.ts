import { Injectable } from '@nestjs/common'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

@Injectable()
export class DossierProjectionService {
  async createTable(demarcheId: number): Promise<void> {
    // TODO
    throw new Error('createTable not implemented')
  }

  async dropTable(demarcheId: number): Promise<void> {
    // TODO
    throw new Error('dropTable not implemented')
  }

  async rebuild(demarche: Demarche): Promise<void> {

    // TODO
    // throw new Error('rebuild not implemented')
  }

  async upsertOneDossier(
    demarche: Demarche,
    dossier: Dossier,
  ): Promise<void> {
    // TODO
    throw new Error('upsert not implemented')
  }
}
