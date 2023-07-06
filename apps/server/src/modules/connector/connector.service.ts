import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { Connector } from "./connector.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseEntityService } from "../../shared/base-entity/base-entity.service";
import { LoggerService } from "../../shared/modules/logger/logger.service";

@Injectable()
export class ConnectorService extends BaseEntityService<Connector> {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Connector) protected readonly repo: Repository<Connector>,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private _upsertConnector(toUpsert: Partial<Connector>) {
    this.logger.verbose("_upsertConnector");
    return this.repo
      .createQueryBuilder()
      .insert()
      .into(Connector)
      .values(toUpsert)
      .orUpdate(
        [
          "name",
          "method",
          "url",
          "params",
          "query",
          "typeAuth",
          "token",
          "updateAt",
        ],
        "UK_CONNECTOR_NAME",
        {
          skipUpdateIfNoValuesChanged: true,
        },
      )
      .returning([
        "id",
        "method",
        "name",
        "url",
        "params",
        "query",
        "typeAuth",
        "token",
      ])
      .execute();
  }

  async findOneBySourceName(name: string): Promise<Connector> {
    return await this.repo.findOneBy({ name });
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async upsert(connector: Partial<Connector>) {
    const upsertConnectorResult = await this._upsertConnector(connector);
    return upsertConnectorResult.raw[0];
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
