import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { isRnfLuhnValid } from '@/shared/utils/rnf.utils'
import { IRnfOutput } from '@biblio-num/shared'
import { GetUpdateFoundationInputDto } from '../objects/dto/get-updated-foundation-input.dto'

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
      .get(`${this.config.get('rnf.url')}/api/foundations/${idRnf}`)
      .then(response => {
        return response.data
      })
  }

  async getUpdatedFoundations(args: GetUpdateFoundationInputDto): Promise<string[]> {
    const url = `${this.config.get('rnf.url')}/api/foundations/last-updated-list`
    return axios
      .post(encodeURI(url), args)
      .then(response => {
        return response.data
      })
  }
}
