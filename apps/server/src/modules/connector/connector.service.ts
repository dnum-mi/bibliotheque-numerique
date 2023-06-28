import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { LoggerService } from "../../shared/modules/logger/logger.service";
import { AxiosResponse } from "axios";
import { Connector } from "./connector.entity";

@Injectable()
export class ConnectorService {
  constructor(private readonly httpService: HttpService) {}

  async findAll(): Promise<Connector[]> {
    return Connector.find();
  }

  async findOneById(id: number): Promise<Connector> {
    return Connector.findOneBy({ id });
  }

  async findOneBySourceName(name: string): Promise<Connector> {
    return await Connector.findOneBy({ name });
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async upsert(connector: Partial<Connector>) {
    const upsertConnectorResult = await Connector.upsertConnector(connector);
    return upsertConnectorResult.raw[0];
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async remove(id: number) {
    return await Connector.delete({ id });
  }

  async getResult(
    entity: Connector,
    params: Record<string, string>,
    query?: Record<string, string>,
  ): Promise<AxiosResponse> {
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
