/* eslint-disable */

import { fabulousAssociationDataMock } from './data/fabulous-association.data.mock'

export const rnaServiceMock = {
  getAssociation: jest
    .fn()
    .mockImplementation(async (rnaId: string) => {
      switch (rnaId) {
        case "W271000008":
          return fabulousAssociationDataMock;
        default:
          return null;
      }
    }),
};
