import { FoundationTypeKey } from "./enums";
import { IDsEvent } from "./ds-event-output.interface";
import { ISiafOrganisme } from "./organisme-output.interface";

export interface IFoundationOutput extends ISiafOrganisme {
    foundationType: FoundationTypeKey;
    generalInterestDomain: string;

    events: IDsEvent<IFoundationOutput>[];
}
