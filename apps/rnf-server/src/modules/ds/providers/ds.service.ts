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
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { InfoDSOutputDto } from '../../foundation/objects/dto/info-ds-output.dto'

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
    const httpProxy: string | undefined = this.config.get('ds.httpProxy')
    if (!api || !token) {
      throw new Error('DS API not configured. Check your env.')
    } else {
      this.dsApiClient = new DsApiClient(api, token, httpProxy)
      this.logger.debug(
        `DS API Client configured with: \n   api = ${api}\n   token = ***${token.slice(-8)}\n   proxy = ${httpProxy}`,
      )
    }
  }

  async writeRnfIdInPrivateAnnotation(
    dossierGraphQlId: string,
    instructeurId: string,
    rnfId: string,
    ds: InfoDSOutputDto,
  ): Promise<void> {
    this.logger.verbose('writeRnfIdInPrivateAnnotation')
    if (!ds.demarcheId) {
      throw new Error('DemarcheId is missing.')
    }
    const annotationId = this.dsConfigurationService.getAnnotationIdByDemarcheId(ds.demarcheId)
    if (!annotationId) {
      throw new Error(`Configuration error, not annotation id for demarche ${ds.demarcheId}`)
    }
    const input: DossierModifierAnnotationTextInput = {
      dossierId: dossierGraphQlId,
      instructeurId,
      annotationId,
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
      .then((response: { dossier: DossierWithCustomChamp }) => response.dossier)
  }

  async getOneDemarcheWithDossier(idDemarche: number, lastRefreshedAt: Date): Promise<IDsApiClientDemarche> {
    this.logger.verbose('getOneDemarcheWithDossier')
    return this.dsApiClient.demarcheDossierWithCustomChamp(idDemarche, lastRefreshedAt)
  }
}
