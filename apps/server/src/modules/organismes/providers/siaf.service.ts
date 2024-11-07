import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import type { ISiafAssociationOutput, ISiafFondationOutput, ISiafSearchOrganismeOutput } from '@biblio-num/shared'
import axios, { AxiosInstance } from 'axios'

export interface IAssociations {
  associations: ISiafAssociationOutput
}
export interface IFondations {
  fondations: ISiafFondationOutput
}
@Injectable()
export class SiafService {
  axios: AxiosInstance

  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
    this.axios = axios.create({
      baseURL: this.config.get('siaf.url'),
      headers: {
        'X-API-KEY': `${this.config.get('siaf.key')}`,
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

  async getAssociation(idRna: string): Promise<IAssociations | null> {
    this.logger.verbose('SIAF-getAssociation')
    const url = `/associations/${idRna}`
    return this.axios
      .get(url)
  }

  async getFoundation(idRnf: string): Promise<IFondations | null> {
    this.logger.verbose('SIAF-getFondation')
    const url = `/fondations/${idRnf}`
    return this.axios
      .get(url)
  }

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOutput | null> {
    this.logger.verbose('SIAF-search')
    const url = `${this.config.get('siaf.url')}/generic/full_text_search/${sentence}`
    return this.axios
      .get(url)
  }
}
