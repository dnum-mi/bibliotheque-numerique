import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Demarche,
  DossierConnection,
  DossierModifierAnnotationTextInput,
  DossierWithCustomChamp,
  DsApiClient,
} from '@dnum-mi/ds-api-client'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { FoundationType } from '@prisma/client'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'

export interface IDsApiClientDemarche {
  demarche: Partial<Demarche> & {
    dossiers: DossierConnection & { nodes: DossierWithCustomChamp[] }
  }
}

@Injectable()
export class DsService {
  private dsApiClient: DsApiClient

  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private dsConfigurationService: DsConfigurationService,
  ) {
    this.logger.setContext(this.constructor.name)
    const api: string | undefined = this.config.get('ds.api')
    const token: string | undefined = this.config.get('ds.token')
    const httpProxy: string | undefined = this.config.get('ds.proxy')
    if (!api || !token) {
      throw new Error('DS API not configured. Check your env.')
    } else {
      this.dsApiClient = new DsApiClient(api, token, httpProxy)
      this.logger.debug(
        `DS API Client configured with: \n   api = ${api}\n   token = ***${token.slice(
          -8,
        )}`,
      )
    }
  }

  private _giveAnnotationId(ft: FoundationType) {
    switch (ft) {
    case FoundationType.FE:
      return this.dsConfigurationService.configuration
        .dsDemarcheFECreationAnnotationId
    case FoundationType.FDD:
      return this.dsConfigurationService.configuration
        .dsDemarcheFDDCreationAnnotationId
    case FoundationType.FRUP: // TODO:
      return 'someId'
    }
  }

  async writeRnfIdInPrivateAnnotation(
    dossierGraphQlId: string,
    instructeurId: string,
    foundationType: FoundationType,
    rnfId: string,
  ): Promise<void> {
    this.logger.verbose('writeRnfIdInPrivateAnnotation')
    const input: DossierModifierAnnotationTextInput = {
      dossierId: dossierGraphQlId,
      instructeurId,
      annotationId: this._giveAnnotationId(foundationType),
      value: rnfId,
    }
    this.logger.debug('input: ' + JSON.stringify(input))
    return this.dsApiClient
      .writeInPrivateAnnotation(input)
      .then((response: boolean) => {
        if (!response) {
          throw new Error(
            'DS API error, could not update value for unknown reason.',
          )
        } else {
          this.logger.log(
            'private annotation field has been updated on DS API.',
          )
        }
      })
  }

  async getOneDossier(idDossier: number): Promise<DossierWithCustomChamp> {
    this.logger.verbose('getOneDossier')
    return this.dsApiClient
      .dossierWithCustomChamp(idDossier)
      .then((response: { dossier: DossierWithCustomChamp }) => {
        this.logger.debug(
          'DS API response: ' + JSON.stringify(response.dossier),
        )
        return response.dossier
      })
  }

  async getOneDemarcheWithDossier(idDemarche: number, lastRefreshedAt: Date): Promise<IDsApiClientDemarche> {
    this.logger.verbose('getOneDemarcheWithDossier')
    return this.dsApiClient.demarcheDossierWithCustomChamp(idDemarche, lastRefreshedAt)
  }
}
