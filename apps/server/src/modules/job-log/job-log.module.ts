import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JobLog } from "./objects/job-log.entity";
import { JobLogController } from "./controllers/job-lob.controller";
import { JobLogService } from "./providers/job-log.service";

@Module({
  imports: [TypeOrmModule.forFeature([JobLog])],
  controllers: [JobLogController],
  providers: [JobLogService],
  exports: [JobLogService],
})
export class JobLogModule {}
