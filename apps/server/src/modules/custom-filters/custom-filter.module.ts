import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { CustomFilterController } from '@/modules/custom-filters/controllers/custom-filter.controller'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'

@Module({
  imports: [TypeOrmModule.forFeature([CustomFilter])],
  controllers: [CustomFilterController],
  providers: [CustomFilterService],
  exports: [CustomFilterService],
})
export class CustomFilterModule {}
