import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import type { ISiafAssociationOutput, ISiafFondationOutput } from '@biblio-num/shared'
import axios from 'axios'

export interface IAssociations {
  associations: ISiafAssociationOutput
}
export interface IFondations {
  fondations: ISiafFondationOutput
}
@Injectable()
export class SiafService {
  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private get siafAssicaitonsUrl(): string {
    return `${this.config.get('siaf.url')}/associations`
  }

  // TODO: A valider avec hub
  private get siafFondationsUrl(): string {
    return `${this.config.get('siaf.url')}/fondations`
  }

  async getAssociation(idRna: string): Promise<IAssociations | null> {
    this.logger.verbose('SIAF-getAssociation')
    const url = `${this.siafAssicaitonsUrl}/${idRna}`
    return axios
      .get(url, {
        headers: {
          'X-API-KEY': `${this.config.get('siaf.key')}`,
        },
      })
      .then((response) => {
        return response.data
      })
      .catch((e) => {
        const code = e.response?.status
        if (code === 404) {
          return null
        }
        throw e
      })
  }

  async getFoundation(idRnf: string): Promise<IFondations | null> {
    this.logger.verbose('SIAF-getFondation')
    const url = `${this.siafFondationsUrl}/${idRnf}`
    return axios
      .get(url, {
        headers: {
          'X-API-KEY': `${this.config.get('siaf.key')}`,
        },
      })
      .then((response) => {
        console.log(response)
        return response.data
      })
      .catch((e) => {
        const code = e.response?.status
        if (code === 404) {
          return null
        }
        throw e
      })
  }
}
