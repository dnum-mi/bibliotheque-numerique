import { Module } from "@nestjs/common";
import { ConnectorService } from "./connector.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
