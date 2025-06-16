import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import type {
  ISiafAssociationOutput,
  ISiafRnaOutput,
  ISiafRnfOutput,
  ISiafSearchOrganismeOutput,
} from '@biblio-num/shared'
import axios, { AxiosInstance } from 'axios'
import { Stream } from 'node:stream'

export interface IAssociations {
  associations: ISiafRnaOutput | ISiafAssociationOutput
}
export interface IFondations {
  fondations: ISiafRnfOutput
}

const ePathCompletedOrganismeByType = {
  association: '/associations',
  foundation: '/fondations',
} as const

@Injectable()
export class HubService {
  axios: AxiosInstance

  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
    this.axios = axios.create({
      baseURL: this.config.get('siafHub.url'),
      headers: {
        'X-API-KEY': `${this.config.get('siafHub.key')}`,
        'Content-Type': 'application/json',
      },
    })
    this.axios.interceptors.response.use(response => response.data, e => {
      const code = e.response?.status
      if (code === 404) {
        this.logger.warn(e)
        return null
      }
      throw e
    })
  }

  async _getFileToStream(id: string, uuid: string, pathRoot: string): Promise<Stream> {
    this.logger.verbose('HUB-getFile')
    const url = `${pathRoot}/${id}/attachment/${uuid}`

    return this.axios
      .get(url, { responseType: 'stream' })
  }

  //#region ASSOCIATIONS
  async getAssociation(idRna: string): Promise<IAssociations | ISiafRnaOutput | null> {
    this.logger.verbose('HUB-getAssociation')
    const path = `${ePathCompletedOrganismeByType.association}/${idRna}`
    return this.axios
      .get(path)
  }

  async getAssociationFile(id: string, uuid: string): Promise<Stream> {
    this.logger.verbose('HUB-getAssociationFile')
    return this._getFileToStream(id, uuid, ePathCompletedOrganismeByType.association)
  }
  //#endregion ASSOCIATIONS

  //#region FOUNDATIONS
  async getFoundation(idRnf: string): Promise<IFondations | ISiafRnfOutput | null> {
    this.logger.verbose('HUB-getFondation')
    const path = `${ePathCompletedOrganismeByType.foundation}/${idRnf}`
    return this.axios
      .get<IFondations | ISiafRnfOutput>(path)
      .then(response => {
        return response as unknown as IFondations | ISiafRnfOutput
      })
  }

  async getFoundationFile(id: string, uuid: string): Promise<Stream> {
    this.logger.verbose('HUB-getFoundationFile')
    return this._getFileToStream(id, uuid, ePathCompletedOrganismeByType.foundation)
  }
  //#endregion FOUNDATIONS

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOutput | null> {
    this.logger.verbose('HUB-search')
    const path = `/generic/full_text_search/${sentence}`
    return this.axios
      .get(path)
  }
}
