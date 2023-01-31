import { Inject, Injectable, Logger } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { ConnectorSourceEntity } from "../../entities/connectorSourceEntity";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class ConnectorService<T extends ConnectorSourceEntity> {
  private readonly logger = new Logger(
    ConnectorService.name,
  ) as unknown as LoggerService;

  private connectorName: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject("SOURCE_PROVIDER")
    private source: {
      new (): T;
    },
  ) {
    this.connectorName = source.name;
  }

  async getResult(
    entity: T,
    params: Record<string, string>,
    query?: Record<string, string>,
  ) {
    const url = this.buildUrl(entity.url, params, {
      ...entity.query,
      ...query,
    });
    return await this.httpService.axiosRef({
      method: entity.method,
      url,
      headers: {
        Authorization: `${entity.typeAuth} ${entity.token}`,
      },
    });
  }

  private buildUrl(
    url: string,
    params: Record<string, string>,
    query: Record<string, string>,
  ): string {
    for (const paramKey in params) {
      url = url.replace(
        `\${${paramKey}}`,
        encodeURIComponent(params[paramKey]),
      );
    }
    for (const queryKey in query) {
      url = url.replace(`\${${queryKey}}`, encodeURIComponent(query[queryKey]));
    }
    return url;
  }
}
