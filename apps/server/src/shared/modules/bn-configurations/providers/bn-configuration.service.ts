import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BnConfiguration } from '@/shared/modules/bn-configurations/objects/entities/bn-configuration.entity'
import { BnConfigurationDefault } from '@/shared/modules/bn-configurations/objects/const/bn-configuration-default.const'
import { BnConfigurationKey } from '@biblio-num/shared'

@Injectable()
export class BnConfigurationService extends BaseEntityService<BnConfiguration> {
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

  async findByKeyName(keyName: BnConfigurationKey): Promise<BnConfiguration> {
    this.logger.verbose('findByKeyName')
    let configuration = await this.repo.findOneBy({ keyName })
    if (!configuration) {
      this.logger.warn(
        `Configuration with keyName ${keyName} not found in database`,
      )
      configuration = await this.findInDefaultConfiguration(keyName)
    }
    return configuration
  }

  async setConfig(
    keyName: BnConfigurationKey,
    stringValue: string,
  ): Promise<void> {
    this.logger.verbose('setConfig')
    await this.repo.update({ keyName }, { stringValue })
  }

  async findInDefaultConfiguration(
    keyName: BnConfigurationKey,
  ): Promise<BnConfiguration> {
    this.logger.verbose('findInDefaultConfiguration')
    const configMandatoryValue = BnConfigurationDefault[keyName]
    if (!configMandatoryValue) {
      this.logger.error(
        `Configuration with keyName ${keyName} not found in default configuration`,
      )
      throw new BadRequestException(
        `Configuration with keyName ${keyName} not found in default configuration`,
      )
    }
    return {
      id: 0,
      keyName,
      stringValue: configMandatoryValue.stringValue,
      valueType: configMandatoryValue.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private async createMissingMandatoryData(): Promise<void> {
    this.logger.verbose('createMissingMandatoryData')
    for (const keyName in Object.keys(BnConfigurationDefault)) {
      // @ts-ignore  enum bug again, TODO: why ?
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
}
