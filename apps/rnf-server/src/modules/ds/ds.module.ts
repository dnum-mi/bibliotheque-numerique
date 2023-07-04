import { Module } from "@nestjs/common";
import { DsService } from "@/modules/ds/providers/ds.service";
import { DsMapperService } from "@/modules/ds/providers/ds-mapper.service";
import { DsController } from "@/modules/ds/controllers/ds.controller";

@Module({
  imports: [],
  controllers: [DsController],
  providers: [DsService, DsMapperService],
  exports: [DsService, DsMapperService],
})
export class DsModule {}
