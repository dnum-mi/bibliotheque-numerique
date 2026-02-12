import { Injectable } from '@nestjs/common'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

@Injectable()
export class FieldProjectionService {
  async createTable(demarche: Demarche): Promise<void> {
    // TODO
    throw new Error('createTable not implemented')
  }

  async dropTable(demarche: Demarche): Promise<void> {
    // TODO
    throw new Error('dropTable not implemented')
  }

  async rebuild(demarche: Demarche): Promise<void> {
    // TODO
    throw new Error('rebuild not implemented')
  }

  async upsert(
    demarche: Demarche,
    dossier: Dossier,
  ): Promise<void> {
    // TODO
    throw new Error('upsert not implemented')
  }
}
