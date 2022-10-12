import { Injectable } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Demarche } from "@lab-mi/ds-api-client/dist/@types/types";

@Injectable()
export class DemarchesService {
  async getDemarche(id: number): Promise<{ demarche: Partial<Demarche> }> {
    const dsApiClient = new DsApiClient(
      process.env.API_URL,
      process.env.API_TOKEN,
    );
    return await dsApiClient.demarche(id);
  }
}
