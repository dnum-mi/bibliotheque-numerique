import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import type {
  ISiafRnaOutput,
  ISiafRnfOutput,
  ISiafSearchOrganismeOutput,
} from '@biblio-num/shared'
import axios, { AxiosInstance } from 'axios'

export interface IAssociations {
  associations: ISiafRnaOutput
}
export interface IFondations {
  fondations: ISiafRnfOutput
}
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
    this.axios.interceptors.response.use(reponse => reponse.data, e => {
      const code = e.response?.status
      if (code === 404) {
        return null
      }
      throw e
    })
  }

  async getAssociation(idRna: string): Promise<IAssociations | ISiafRnaOutput | null> {
    this.logger.verbose('HUB-getAssociation')
    const path = `/associations/${idRna}`
    return this.axios
      .get(path)
  }

  async getFoundation(idRnf: string): Promise<IFondations | ISiafRnfOutput | null> {
    this.logger.verbose('HUB-getFondation')
    const path = `/fondations/${idRnf}`
    return this.axios
      .get(path)
  }

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOutput | null> {
    this.logger.verbose('HUB-search')
    const path = `/generic/full_text_search/${sentence}`
    return this.axios
      .get(path)
  }
}
