import { DynamicModule, Module } from "@nestjs/common";
import { ConnectorService } from "./connector.service";

@Module({})
export class ConnectorModule {
  static register<TSource>(source: TSource): DynamicModule {
    return {
      module: ConnectorModule,
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
