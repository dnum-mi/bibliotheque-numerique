import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { IRnaOutput } from '@biblio-num/shared'

@Injectable()
export class RnaService {
  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private get rnaUrl(): string {
    return `${this.config.get('rna.url')}/djepva/api-association/associations`
  }

  private get defaultQueryArgs(): string {
    return `context=biblio_numerique&object=biblio_numerique&recipient=${this.config.get(
      'rna.recipient',
    )}`
  }

  async getAssociation(idRna: string): Promise<IRnaOutput> {
    const url = `${this.rnaUrl}/${idRna}?${this.defaultQueryArgs}`
    return axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${this.config.get('rna.token')}`,
        },
      })
      .then((response) => {
        return response.data.data
      })
  }
}
