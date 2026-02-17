import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ViewController } from '@/modules/views/controllers/view.controller'
import { ViewService } from '@/modules/views/providers/services/view.service'
import { DossierModule } from '../dossiers/dossier.module'
import { View } from '@/modules/views/objects/entities/view.entity'
import { ProjectionModule } from '@/modules/projection/projection.module'

@Module({
  imports: [
    // TODO: DossierModule should not be a forwardRef but its the only way to have InstructionTime unit test
    // to work for now. When instruction time will have real unit test, delete the forward ref
    forwardRef(() => DossierModule),
    TypeOrmModule.forFeature([View]),
    ProjectionModule,
  ],
  controllers: [ViewController],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
