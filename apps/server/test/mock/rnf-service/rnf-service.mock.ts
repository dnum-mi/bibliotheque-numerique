/* eslint-disable */

import { ChocolateFoundationDataMock } from './data/chocolate-foundation.data.mock'

export const rnfServiceMock = {
  getFoundation: jest
    .fn()
    .mockImplementation(async (rnfId: string) => {
      switch (rnfId) {
        case "033-FE-00001-02":
          return ChocolateFoundationDataMock;
        default:
          return null;
      }
    }),
  getUpdatedFoundations: jest.fn()
    .mockImplementation(() => {
      return []
    })
};
