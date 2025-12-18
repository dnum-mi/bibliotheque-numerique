import { FoundationTypeKey } from "./enums";
import { ISiafOrganisme } from "./organisme-output.interface";

export interface IFoundationOutput extends ISiafOrganisme {
    foundationType: FoundationTypeKey;
    generalInterestDomain: string;
}
