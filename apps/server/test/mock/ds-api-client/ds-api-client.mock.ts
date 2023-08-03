/* eslint-disable */

import { demarcheFinancementEtrangerDataMock } from "./data/demarche-financement-etranger.data.mock";
import { demarcheAndDossierFinancementEtrangerDataMock } from "./data/demarche-and-dossier-financement-etranger.data.mock";
import { smallDemarcheAndDossierFinancementEtrangerDataMock } from "./data/small-demarche-and-dossier-financement-etranger.data.mock";

export const dsApiClientMock = {
  demarche: jest.fn().mockImplementation(async (idDemarche: number) => {
    switch (idDemarche) {
      case 29:
        return demarcheFinancementEtrangerDataMock;
      case 42:
        return {
          demarche: {
            ...demarcheFinancementEtrangerDataMock.demarche,
            number: 42,
          },
        };
      default:
        return null;
    }
  }),
  demarcheDossiers: jest.fn().mockImplementation(async (idDemarche: number) => {
    switch (idDemarche) {
      case 29:
        return demarcheAndDossierFinancementEtrangerDataMock;
      case 42:
        return smallDemarcheAndDossierFinancementEtrangerDataMock;
      default:
        return null;
    }
  }),
};
