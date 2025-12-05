import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import type {
  IAssociationOutput,
  IFoundationOutput,
  ISiafSearchOrganismeOutput,
} from '@biblio-num/shared'
import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios'
import { Stream } from 'node:stream'
import { ILastFoundationOuptut } from '../last-foundation-output.type'
import { ILastOrganismeOuptut } from '../last-commun-output.type'
import { ILastAssocationOuptut } from '../last-assocation-output.type'
import { IDsEvent } from '@biblio-num/shared/'

export interface IAssociations {
  associations: IAssociationOutput
}
export interface IFondations {
  fondations: IFoundationOutput
}

const ePathCompletedOrganismeByType = {
  association: '/associations',
  foundation: '/fondations',
} as const

@Injectable()
export class HubService {
  axios: AxiosInstance
  axiosFiles: AxiosInstance
  axiosConfig: CreateAxiosDefaults
  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)

    this.axiosConfig = {
      baseURL: this.config.get('siafHub.url'),
      headers: {
        'X-API-KEY': `${this.config.get('siafHub.key')}`,
        'Content-Type': 'application/json',
      },
    }
    this.axios = axios.create(this.axiosConfig)
    this.axiosFiles = axios.create(this.axiosConfig)
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

    const resp = await this.axiosFiles.get(url, {
      responseType: 'stream',
    })

    return resp.data
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
  async getAssociation(idRna: string): Promise<IAssociations | IAssociationOutput | null> {
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
  async getFoundation(idRnf: string): Promise<IFondations | IFoundationOutput | null> {
    this.logger.verbose('HUB-getFondation')
    const path = `${ePathCompletedOrganismeByType.foundation}/${idRnf}`
    return this.axios
      .get<IFondations | IFoundationOutput>(path)
      .then(response => {
        return response as unknown as IFondations | IFoundationOutput
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

  async getFoundationEvents(idRnf: string): Promise<IDsEvent<IFoundationOutput> | null> {
    this.logger.verbose('HUB-getFoundationEvents')
    const path = `${ePathCompletedOrganismeByType.foundation}/${idRnf}/events`
    return this.axios.get<IDsEvent<IFoundationOutput>>(path).then(response => {
      return response as unknown as IDsEvent<IFoundationOutput>
    })
  }
  //#endregion FOUNDATIONS

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOutput | null> {
    const cleanedSentence = sentence.trim()
    this.logger.verbose(`HUB-search: ${cleanedSentence}`)
    const path = `/generic/full_text_search/${encodeURIComponent(cleanedSentence)}`
    return this.axios
      .get(path)
  }
}
