import { Injectable, NotFoundException } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import {
  IAssociationOutput,
  IFoundationOutput,
  ISiafSearchOrganismeOneOutput,
  fromAssociationToBasicOrganisme,
  fromFoundationToBasicOrganisme,
  organismeCategoryKey,
  EOrganismeCategory,
} from '@biblio-num/shared'
import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios'
import { Stream } from 'node:stream'
import { IRafEvent } from '@biblio-num/shared/types/hub/raf-event.interface'

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
    this.axios.interceptors.response.use(response => response, e => {
      const code = e.response?.status
      if (code === 404) {
        this.logger.warn(e.response?.data?.detail)
        throw new NotFoundException(e.response?.data?.detail)
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

  //#region ASSOCIATIONS
  async getAssociation(idRna: string): Promise<IAssociationOutput | null> {
    this.logger.verbose('HUB-getAssociation')
    const path = `${ePathCompletedOrganismeByType.association}/${idRna}`
    return this.axios.get<IAssociationOutput>(path).then(r => r.data)
  }

  async getAssociationFile(id: string, uuid: string): Promise<Stream> {
    this.logger.verbose('HUB-getAssociationFile')
    return this._getFileToStream(id, uuid, ePathCompletedOrganismeByType.association)
  }
  //#endregion ASSOCIATIONS

  //#region FOUNDATIONS
  async getFoundation(idRnf: string): Promise<IFoundationOutput | null> {
    this.logger.verbose('HUB-getFondation')
    const path = `${ePathCompletedOrganismeByType.foundation}/${idRnf}`
    const eventPath = `${ePathCompletedOrganismeByType.foundation}/${idRnf}/events`
    const events = await this.axios.get<{events:IRafEvent[]}>(eventPath).then(r => {
      return r.data.events
    })
    return this.axios.get<IFoundationOutput>(path).then(response => {
      return {
        ...response.data,
        events,
      }
    })
  }

  async getFoundationFile(id: string, uuid: string): Promise<Stream> {
    this.logger.verbose('HUB-getFoundationFile')
    return this._getFileToStream(id, uuid, ePathCompletedOrganismeByType.foundation)
  }
  //#endregion FOUNDATIONS

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOneOutput[]> {
    const cleanedSentence = sentence.trim()
    this.logger.verbose(`HUB-search: ${cleanedSentence}`)
    const path = `/generic/full_text_search/${encodeURIComponent(cleanedSentence)}`
    return this.axios.get(path)
      // @ts-ignore TODO: separate type from HUB to Bibli
      .then((r) => r?.data?.search_response
        .map((r2: {entity: IAssociationOutput | IFoundationOutput, entity_type: organismeCategoryKey}) => {
          if (r2.entity_type === EOrganismeCategory.association) {
            return fromAssociationToBasicOrganisme(r2.entity as IAssociationOutput)
          } else {
            return fromFoundationToBasicOrganisme(r2.entity as IFoundationOutput)
          }
        }),
      )
  }
}
