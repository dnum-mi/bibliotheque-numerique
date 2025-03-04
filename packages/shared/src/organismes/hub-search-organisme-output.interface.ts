import { ISiafAssociationOutput, ISiafFondationOutput } from "./hub-output.interface"


export enum EEntityTypeSearchOrganisme {
  association,
  fondation
}
export interface ISiafSearchOrganismeResponseOutput {
  score: number;
  entity_type: EEntityTypeSearchOrganisme;
  entity: {
    id: string;
    title: string;
    email: string;
    phone: string;
    foundationType: string;
    department: string;
    originalDepartment: string;
    createdAt: string;
    updatedAt: string;
    originalCreatedAt: string;
    fiscalEndDateAt: string;
    declarationYears: string[];
    dissolved: {
      otherFiles: string[];
    };
    status: {
      file: {
        id: string;
        name: string;
        checksum: string;
        byteSize: number;
        mimeType: string;
      };
    };
    address: {
      dsStringValue: string;
      coordinates: [number | null, number | null];
    };
    persons: {
      lastName: string;
      firstName: string;
      profession: string;
      nationality: string;
      bornAt: string;
      isFounder: boolean;
      role: string;
      residenceCountry: string;
      entryDate: string;
      jobPosition: string;
      address: {
        dsStringValue: string;
        coordinates: [number | null, number | null];
        dsAddress: {
          label: string;
          type: string;
          streetAddress: string;
          streetNumber: string;
          streetName: string;
          postalCode: string;
          cityName: string;
          cityCode: string;
          departmentName: string;
          departmentCode: string;
          regionName: string;
          regionCode: string;
        };
        gouvAddress: {
          label: string;
          housenumber: string;
          name: string;
          postcode: string;
          citycode: string;
          city: string;
          context: string;
          type: string;
          street: string;
        };
      };
    }[];
    objectDescription: string;
    generalInterest: string;
    internationalAction: boolean;
    version: number;
    previous_versions: string[];
  };
}

export interface ISiafSearchOrganismeOutput {
  sentence: string,
  search_response: ISiafSearchOrganismeResponseOutput[]
}
