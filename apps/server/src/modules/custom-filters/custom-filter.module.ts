import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { CustomFilterController } from '@/modules/custom-filters/controllers/custom-filter.controller'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import { DemarcheModule } from '../demarches/demarche.module'
import { CustomFilterDemarcheController } from './controllers/custom-filter-demarche.controller'

@Module({
  imports: [DemarcheModule, TypeOrmModule.forFeature([CustomFilter])],
  controllers: [CustomFilterController, CustomFilterDemarcheController],
  providers: [CustomFilterService],
  exports: [CustomFilterService],
})
export class CustomFilterModule {}
