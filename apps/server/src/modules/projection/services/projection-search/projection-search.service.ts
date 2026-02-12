import { Injectable } from '@nestjs/common'

@Injectable()
export class ProjectionSearchService {
  async searchDossier(
    demarcheId: number,
    dto: any, // TODO: typer correctement
  ): Promise<any> {
    // TODO
    throw new Error('searchDossier not implemented')
  }

  async searchField(
    demarcheId: number,
    dto: any, // TODO: typer correctement
  ): Promise<any> {
    // TODO
    throw new Error('searchField not implemented')
  }
}
