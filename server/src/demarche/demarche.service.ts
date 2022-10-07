import { Injectable } from '@nestjs/common';
import { DsApiClient } from "@lab-mi/ds-api-client";

@Injectable()
export class DemarcheService {
    async getDemarche(id: number): Promise<{demarche: Partial<any>}> {
        const dsApiClient = new DsApiClient(process.env.API_URL, process.env.API_TOKEN);
        return await dsApiClient.demarche(id);
    }
}
