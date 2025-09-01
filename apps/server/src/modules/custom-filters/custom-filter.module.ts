import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { CustomFilterController } from '@/modules/custom-filters/controllers/custom-filter.controller'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import { DossierModule } from '../dossiers/dossier.module'

@Module({
  imports: [
    // TODO: DossierModule should not be a forwardRef but its the only way to have InstructionTime unit test
    // to work for now. When instruction time will have real unit test, delete the forward ref
    forwardRef(() => DossierModule),
    TypeOrmModule.forFeature([CustomFilter])],
  controllers: [CustomFilterController],
  providers: [CustomFilterService],
  exports: [CustomFilterService],
})
export class CustomFilterModule {}
