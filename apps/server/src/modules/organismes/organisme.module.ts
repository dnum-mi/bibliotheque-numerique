import { forwardRef, Module } from '@nestjs/common'
import { OrganismeController } from '@/modules/organismes/controllers/organisme.controller'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { RnfService } from '@/modules/organismes/providers/rnf.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { DossierModule } from '@/modules/dossiers/dossier.module'
import { XlsxModule } from '../../shared/modules/xlsx/xlsx.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisme]),
    forwardRef(() => DossierModule),
    XlsxModule,
  ],
  controllers: [OrganismeController],
  providers: [OrganismeService, RnaService, RnfService],
  exports: [OrganismeService],
})
export class OrganismeModule {}
