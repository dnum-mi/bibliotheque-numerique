import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { isRnfLuhnValid } from '@/shared/utils/rnf.utils'
import { IRnfOutput, ISiafRnfOutput } from '@biblio-num/shared'
import { GetUpdateFoundationInputDto } from '../objects/dto/get-updated-foundation-input.dto'

@Injectable()
export class RnfService {
  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async getFoundation(idRnf: string): Promise<IRnfOutput | ISiafRnfOutput> {
    this.logger.verbose('getFoundation')
    if (!idRnf || !isRnfLuhnValid(idRnf)) {
      this.logger.error(
        `RNF ID is invalid: ${idRnf}${
          isRnfLuhnValid(idRnf) ? '' : ' (Luhn check failed)'
        }`,
      )
      return null
    }

    const url = `${this.config.get('rnf.siafUrl')}/foundations/${idRnf}/complete`

    return axios
      .get(url, {
        headers: {
          'x-user-token': this.config.get('rnf.siafToken'),
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

  async getUpdatedFoundations(
    args: GetUpdateFoundationInputDto,
  ): Promise<string[]> {
    this.logger.verbose('getUpdatedFoundations')
    const url = `${this.config.get(
      'rnf.siafUrl',
    )}/foundations/last-updated-list`

    return axios.post(
      encodeURI(url),
      args,
      {
        headers: {
          'x-user-token': this.config.get('rnf.siafToken'),
        },
      },
    ).then((response) => {
      return response.data
    })
  }
}
