import { Injectable } from '@nestjs/common'

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

  async rebuild(demarcheId: number): Promise<void> {
    // TODO
    throw new Error('rebuild not implemented')
  }

  async upsert(
    demarcheId: number,
    dossierId: string,
  ): Promise<void> {
    // TODO
    throw new Error('upsert not implemented')
  }
}
