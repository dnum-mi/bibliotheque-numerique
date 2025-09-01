import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BnConfiguration } from '@/shared/modules/bn-configurations/objects/entities/bn-configuration.entity'
import { BnConfigurationController } from '@/shared/modules/bn-configurations/controllers/bn-configuration.controller'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'

@Module({
  imports: [TypeOrmModule.forFeature([BnConfiguration])],
  controllers: [BnConfigurationController],
  providers: [BnConfigurationService],
  exports: [BnConfigurationService],
})
export class BnConfigurationModule {}
