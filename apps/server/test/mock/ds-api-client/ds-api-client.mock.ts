/* eslint-disable */

import {
  demarcheAndDossierFeDataMock
} from './data/demarche-and-dossier-fe.data.mock'
import {
  smallDemarcheAndDossierFeDataMock
} from './data/small-demarche-and-dossier-fe.data.mock'
import {
  demarcheWithRnfAndRnaDataMock
} from './data/demarche-with-rnf-and-rna.data.mock'
import { demarcheWithPrefectureMock } from './data/demarche-with-prefecture.mock'
import { smallDemarcheAndDossierWithDemandeur } from './data/small-demarche-and-dossiers-with-demandeur-physique';
import { smallDemarcheAndDossierWithDemandeurMoral } from './data/small-demarche-and-dossiers-with-demandeur-moral';

export const dsApiClientMock = {
  demarcheDossierWithCustomChamp: jest
    .fn()
    .mockImplementation(async (idDemarche: number) => {
      switch (idDemarche) {
        case 29:
          return demarcheAndDossierFeDataMock;
        case 42:
          return smallDemarcheAndDossierFeDataMock();
        case 101:
          return demarcheWithRnfAndRnaDataMock;
        case 102:
          return demarcheWithPrefectureMock;
        case 200:
          return smallDemarcheAndDossierWithDemandeur;
        case 300:
          return smallDemarcheAndDossierWithDemandeurMoral;
        default:
          return null;
      }
    }),
};
