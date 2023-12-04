import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { isRnfLuhnValid } from '@/shared/utils/rnf.utils'
import { IRnfOutput } from '@biblio-num/shared'

@Injectable()
export class RnfService {
  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async getFoundation(idRnf: string): Promise<IRnfOutput> {
    if (!isRnfLuhnValid(idRnf)) {
      throw new Error('RNF ID is invalid')
    }
    return axios
      .get(`${this.config.get('RNF_API_URL')}/api/foundations/${idRnf}`)
      .then(response => {
        return response.data
      })
  }
}
