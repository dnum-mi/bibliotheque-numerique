import { forwardRef, Module } from '@nestjs/common'
import { InstructionTimesService } from './instruction_times.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InstructionTime } from './instruction_time.entity'
import { DossierModule } from '../dossiers/dossier.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([InstructionTime]),
    forwardRef(() => DossierModule),
  ],
  providers: [InstructionTimesService],
  exports: [InstructionTimesService],
})
export class InstructionTimesModule {}
