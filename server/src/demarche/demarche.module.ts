import { Module } from '@nestjs/common';
import { DemarcheController } from './demarche.controller';
import { DemarcheService } from './demarche.service';

@Module({
    imports: [],
    controllers: [DemarcheController],
    providers: [DemarcheService],
})
export class DemarcheModule {}
