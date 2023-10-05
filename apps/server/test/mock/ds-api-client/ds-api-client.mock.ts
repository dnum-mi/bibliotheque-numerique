/* eslint-disable */

import {
  demarcheAndDossierFinancementEtrangerDataMock
} from './data/demarche-and-dossier-financement-etranger.data.mock'
import {
  smallDemarcheAndDossierFinancementEtrangerDataMock
} from './data/small-demarche-and-dossier-financement-etranger.data.mock'
import {
  demarcheWithRnfAndRnaDataMock
} from './data/demarche-with-rnf-and-rna.data.mock'

export const dsApiClientMock = {
  demarcheDossierWithCustomChamp: jest
    .fn()
    .mockImplementation(async (idDemarche: number) => {
      switch (idDemarche) {
        case 29:
          return demarcheAndDossierFinancementEtrangerDataMock;
        case 42:
          return smallDemarcheAndDossierFinancementEtrangerDataMock();
        case 101:
          return demarcheWithRnfAndRnaDataMock;
        default:
          return null;
      }
    }),
};
