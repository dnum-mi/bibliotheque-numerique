import { Inject, Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";

interface IConnectServiceRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
}

export interface IConnectorService {
  getResult(
    url: string,
    params?: Record<string, string>[],
    query?: Record<string, string>[],
  ): Promise<any>;
}

@Injectable()
export class ConnectorService<TSource> implements IConnectorService {
  private readonly logger = new Logger(
    ConnectorService.name,
  ) as unknown as LoggerService;

  constructor(@Inject("SOURCE_PROVIDER") private source: TSource) {}

  async getResult() {
    return "ConnectorService.getResult()";
  }
}
