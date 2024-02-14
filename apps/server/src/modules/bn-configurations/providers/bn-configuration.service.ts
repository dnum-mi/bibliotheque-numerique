import { Injectable, NotFoundException } from '@nestjs/common'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BnConfiguration } from '@/modules/bn-configurations/objects/entities/bn-configuration.entity'
import {
  BnConfigurationMandatoryData, BnConfigurationTypes,
} from '@biblio-num/shared-utils'

@Injectable()
export class BnConfigurationService extends BaseEntityService<BnConfiguration> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(BnConfiguration) repo: Repository<BnConfiguration>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.verbose('onApplicationBootstrap in bn-configuration.service')
    await this.createMissingMandatoryData()
  }

  async findByKeyName(keyName: string): Promise<BnConfiguration> {
    this.logger.verbose('findByKeyName')
    let configuration = await this.repo.findOneBy({ keyName })
    if (!configuration) {
      this.logger.warn(`Configuration with keyName ${keyName} not found in database`)
      configuration = await this.findInDefaultConfiguration(keyName)
    }
    return configuration
  }

  async findInDefaultConfiguration(keyName: string): Promise<BnConfiguration> {
    this.logger.verbose('findInDefaultConfiguration')
    const configMandatoryValue = BnConfigurationMandatoryData[keyName]
    if (!configMandatoryValue) {
      this.logger.error(`Configuration with keyName ${keyName} not found in default configuration`)
      throw new NotFoundException(`Configuration with keyName ${keyName} not found in default configuration`)
    }
    return {
      id: 0,
      keyName,
      stringValue: configMandatoryValue,
      valueType: 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private async createMissingMandatoryData(): Promise<void> {
    this.logger.verbose('createMissingMandatoryData')
    for (const keyName in BnConfigurationMandatoryData) {
      const configuration = await this.repo.findOneBy({ keyName })
      if (!configuration) {
        const stringValue = BnConfigurationMandatoryData[keyName]
        const valueType = BnConfigurationTypes.STRING
        await this.repo.save({ keyName, stringValue, valueType })
      }
    }
  }
}
