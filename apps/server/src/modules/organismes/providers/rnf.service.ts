import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { isRnfLuhnValid } from '@/shared/utils/rnf.utils'
import { IRnfOutput } from '@biblio-num/shared'
import { GetFoundationsInputDto } from '../objects/dto/get-foundations-inputs.dto'

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

  async getListFundations(args: GetFoundationsInputDto): Promise<IRnfOutput[]> {
    const date = args.date ? `date=${args.date}&` : ''
    const rnfIds = args.rnfIds.join('&rnfIds=')
    const url = `${this.config.get('RNF_API_URL')}/api/foundations?${date}rnfIds=${rnfIds}`

    return axios
      .get(encodeURI(url))
      .then(response => {
        return response.data
      })
  }
}
