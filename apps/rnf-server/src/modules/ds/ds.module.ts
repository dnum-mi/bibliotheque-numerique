import { Module } from "@nestjs/common";
import { DsService } from "@/modules/ds/providers/ds.service";
import { DsMapperService } from "@/modules/ds/providers/ds-mapper.service";

@Module({
  imports: [],
  controllers: [],
  providers: [DsService, DsMapperService],
  exports: [DsService, DsMapperService],
})
export class DsModule {}
