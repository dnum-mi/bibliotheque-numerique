import { Repository } from 'typeorm'
import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'

import { BnConfigurationKey } from '@biblio-num/shared'

import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { BnConfiguration } from '@/shared/modules/bn-configurations/objects/entities/bn-configuration.entity'
import { BnConfigurationDefault } from '@/shared/modules/bn-configurations/objects/const/bn-configuration-default.const'

@Injectable()
export class BnConfigurationService extends BaseEntityService<BnConfiguration> implements OnApplicationBootstrap {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(BnConfiguration) repo: Repository<BnConfiguration>,
    private readonly configService: ConfigService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.verbose('onApplicationBootstrap in bn-configuration.service')
    if (this.configService.get('createMissingMandatoryConfigurations')) {
      await this.createMissingMandatoryData()
    } else {
      this.logger.log('Skipping create of missing mandatory data.')
    }
  }

  async findByKeyName(keyName: BnConfigurationKey): Promise<BnConfiguration | null> {
    this.logger.verbose('findByKeyName')
    const configuration = await this.repo.findOneBy({ keyName })
    if (!configuration) {
      this.logger.warn(
        `Configuration with keyName ${keyName} not found in database`,
      )
      return null
    }
    this.logger.debug(`Configuration ${keyName}: ${configuration.stringValue}`)
    return configuration
  }

  async setConfig(
    keyName: BnConfigurationKey,
    stringValue: string,
  ): Promise<void> {
    this.logger.verbose('setConfig')
    await this.repo.update({ keyName }, { stringValue })
  }

  private async createMissingMandatoryData(): Promise<void> {
    this.logger.verbose('createMissingMandatoryData')
    for (const keyName of Object.keys(BnConfigurationDefault)) {
      // @ts-ignore enum bug again, TODO: why ?
      const configuration = await this.repo.findOneBy({ keyName })
      if (!configuration) {
        this.logger.debug(`Setting default configuration ${keyName}`)
        const stringValue = BnConfigurationDefault[keyName].stringValue
        const valueType = BnConfigurationDefault[keyName].type
        // @ts-ignore enum bug again, TODO: why ?
        await this.repo.save({ keyName, stringValue, valueType })
      }
    }
  }

  async getValueByKeyName(keyName: BnConfigurationKey): Promise< string| boolean | number | Date | object | null> {
    console.log('___TEST', keyName)
    const bnConf = await this.findByKeyName(keyName)
    switch (bnConf.valueType) {
    case 'string': return bnConf.stringValue
    case 'boolean': return bnConf.stringValue === 'true'
    case 'date': return new Date(bnConf.stringValue)
    case 'number' : return Number(bnConf.stringValue)
    default: return bnConf.stringValue
    }
  }
}
