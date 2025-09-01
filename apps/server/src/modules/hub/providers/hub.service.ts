import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import type {
  ISiafRnaOutput,
  ISiafRnfOutput,
  ISiafSearchOrganismeOutput,
} from '@biblio-num/shared'
import axios, { AxiosInstance } from 'axios'
import { Stream } from 'node:stream'
import { ILastFoundationOuptut } from '../last-foundation-output.type'
import { ILastOrganismeOuptut } from '../last-commun-output.type'
import { ILastAssocationOuptut } from '../last-assocation-output.type'

export interface IAssociations {
  associations: ISiafRnaOutput
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

  async _getLastImport<T extends ILastOrganismeOuptut>(
    pathStr: string,
    lastUpdatedAt: string,
    scrollId?: string,
  ): Promise<T> {
    const dateLastUpdatedAt = new Date(lastUpdatedAt)
    if (!dateLastUpdatedAt) throw new Error(`${lastUpdatedAt} is not date format`)
    const timeStampLastUpdatedAt = Math.trunc(dateLastUpdatedAt.getTime() / 1000)
    let path = `${pathStr}/${timeStampLastUpdatedAt}`
    if (scrollId) {
      path += `?scroll_id=${scrollId}`
    }
    return this.axios.get(path)
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

  async getLastImportedAssociations(lastUpdatedAt: string, scrollId?: string):Promise<ILastAssocationOuptut> {
    this.logger.verbose('getLastImportedFoundations')
    return this._getLastImport<ILastAssocationOuptut>(
      `${ePathCompletedOrganismeByType.association}/last_received_associations`,
      lastUpdatedAt,
      scrollId,
    )
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

  async getLastImportedFoundations(lastUpdatedAt: string, scrollId?: string):Promise<ILastFoundationOuptut> {
    this.logger.verbose('getLastImportedFoundations')
    return this._getLastImport<ILastFoundationOuptut>(
      `${ePathCompletedOrganismeByType.foundation}/last_received_fondations`,
      lastUpdatedAt,
      scrollId,
    )
  }
  //#endregion FOUNDATIONS

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOutput | null> {
    this.logger.verbose('HUB-search')
    const path = `/generic/full_text_search/${sentence}`
    return this.axios
      .get(path)
  }
}
