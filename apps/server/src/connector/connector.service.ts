import { Injectable, Logger } from "@nestjs/common";
import { Connector } from "../entities/";
import { HttpService } from "@nestjs/axios";
import { LoggerService } from "../logger/logger.service";
import { AxiosResponse } from "axios";

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(
    ConnectorService.name,
  ) as unknown as LoggerService;

  constructor(private readonly httpService: HttpService) {}

  async findAll() {
    try {
      return await Connector.find();
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération des connecteurs",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve connectors");
    }
  }

  async findOneById(id: number) {
    try {
      return await Connector.findOneBy({ id });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération du connecteur",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve connector");
    }
  }

  async findOneBySourceName(name: string) {
    try {
      return await Connector.findOneBy({ name });
    } catch (error) {
      this.logger.error({
        short_message: "Échec récupération du connecteur",
        full_message: error.toString(),
      });
      throw new Error("Unable to retrieve connector");
    }
  }

  async upsert(connector: Partial<Connector>) {
    try {
      const upsertConnectorResult = await Connector.upsertConnector(connector);
      return upsertConnectorResult.raw[0];
    } catch (error) {
      this.logger.error({
        short_message: "Échec création du connecteur",
        full_message: error.toString(),
      });
      throw new Error("Unable to create connector");
    }
  }

  async remove(id: number) {
    try {
      return await Connector.delete({ id });
    } catch (error) {
      this.logger.error({
        short_message: `Échec suppression du connecteur id: ${id}`,
        full_message: error.toString(),
      });
      throw new Error(`Unable to remove connector id: ${id}`);
    }
  }

  async getResult(
    entity: Connector,
    params: Record<string, string>,
    query?: Record<string, string>,
  ): Promise<AxiosResponse<any>> {
    try {
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
    } catch (error) {
      this.logger.error({
        short_message: `Connector ${entity?.name}: ${error.message}`,
        full_message: error.stack,
      });
      throw new Error(`Connector ${entity?.name}: ${error.message}`);
    }
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
