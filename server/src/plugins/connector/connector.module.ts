import { DynamicModule, Module } from "@nestjs/common";
import { ConnectorService } from "./connector.service";
import { ConnectorSourceEntity } from "../../entities/connector_source_entity";
import { HttpModule } from "@nestjs/axios";

@Module({})
export class ConnectorModule {
  static register<T extends ConnectorSourceEntity>(source: {
    new (): T;
  }): DynamicModule {
    return {
      module: ConnectorModule,
      imports: [HttpModule.registerAsync({})],
      providers: [
        {
          provide: "SOURCE_PROVIDER",
          useValue: source,
        },
        ConnectorService,
      ],
      exports: [ConnectorService],
    };
  }
}
