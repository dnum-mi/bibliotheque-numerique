import { Test, TestingModule } from "@nestjs/testing";
import { DsService } from "@/modules/ds/providers/ds.service";
import { DsMapperService } from "@/modules/ds/providers/ds-mapper.service";
import { DossierWithCustomChamp } from "@dnum-mi/ds-api-client";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { loggerServiceMock } from "../../../../test/mocks/logger-service.mock";
import { dotationDossierDataMock } from "../../../../test/mocks/datas/dossier-dotation.data.mock";
import { entrepriseDossierDataMock } from "../../../../test/mocks/datas/dossier-entreprise.data.mock";
import { ConfigService } from "@nestjs/config";
import { dnrDossierDataMock } from "../../../../test/mocks/datas/dossier-dnr.data.mock";

describe("DsService", () => {
  let service: DsMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DsMapperService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock;
        }
        if (token === ConfigService) {
          return {
            get: jest.fn().mockImplementation((str: string) => {
              switch (true) {
                case str === "ds.demarcheFDDId":
                  return "37";
                case str === "ds.demarcheFEId":
                  return "12";
                case str === "ds.demarcheDNRId":
                  return "43";
              }
            }),
          };
        }
      })
      .compile();

    service = module.get<DsMapperService>(DsMapperService);
  });

  it("Should throw error if Demarche doesnt exist or champs are empty", () => {
    const title = "!Je suis une démarche qui n'existe pas!";
    expect(() => {
      service.mapDossierToFoundation({
        demarche: {},
      } as DossierWithCustomChamp);
    }).toThrow(`Dossier champs is empty`);
    expect(() => {
      service.mapDossierToFoundation({
        demarche: {},
        champs: [{}],
      } as unknown as DossierWithCustomChamp);
    }).toThrow(`This demarche id is not implemented`);
    expect(() => {
      service.mapDossierToFoundation({
        demarche: { title },
        champs: [{}],
      } as unknown as DossierWithCustomChamp);
    }).toThrow(`This demarche id is not implemented`);
  });

  it("Should correctly map a dotation foundation demarche", () => {
    const result = service.mapDossierToFoundation(dotationDossierDataMock as DossierWithCustomChamp);
    expect(result).toEqual({
      title: "Je suis un titre compliqué avec des espaces et des accents et des MajUsCules",
      type: "FDD",
      address: {
        label: "11 Rue Pelleport 33800 Bordeaux",
        type: "housenumber",
        streetAddress: "11 Rue Pelleport",
        streetNumber: "11",
        streetName: "Rue Pelleport",
        postalCode: "33800",
        cityName: "Bordeaux",
        cityCode: "33063",
        departmentName: "Gironde",
        departmentCode: "33",
        regionName: "Nouvelle-Aquitaine",
        regionCode: "33",
      },
      email: "tata@gmail.com",
      phone: "06 86 46 54 45",
      peopleInFoundationToCreate: null,
    });
  });

  it("Should correctly map a entreprise demarche", () => {
    const result = service.mapDossierToFoundation(entrepriseDossierDataMock as DossierWithCustomChamp);
    expect(result).toMatchObject({
      title: "Test demo",
      type: "FE",
      address: {
        label: "1 Square Wannoschot 59800 Lille",
        type: "housenumber",
        streetAddress: "1 Square Wannoschot",
        streetNumber: "1",
        streetName: "Square Wannoschot",
        postalCode: "59800",
        cityName: "Lille",
        cityCode: "59350",
        departmentName: "Nord",
        departmentCode: "59",
        regionName: "Hauts-de-France",
        regionCode: "32",
      },
      // email: null,
      // phone: null,
      peopleInFoundationToCreate: null,
    });
  });

  it("Should correctly map a demande numéro rnf demarche", () => {
    const result = service.mapDossierToFoundation(dnrDossierDataMock as DossierWithCustomChamp);
    expect(result).toMatchObject({
      title: "Fondation des tulipes",
      type: "FRUP",
      address: {
        label: "3 Rue Colbert 59800 Lille",
        type: "housenumber",
        streetAddress: "3 Rue Colbert",
        streetNumber: "3",
        streetName: "Rue Colbert",
        postalCode: "59800",
        cityName: "Lille",
        cityCode: "59350",
        departmentName: "Nord",
        departmentCode: "59",
        regionName: "Hauts-de-France",
        regionCode: "32",
      },
      email: "tulipe@gmail.com",
      phone: "07 89 89 89 89",
      peopleInFoundationToCreate: null,
    });
  });
});
