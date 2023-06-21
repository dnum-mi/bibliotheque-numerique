import { dotationDossierDataMock } from "@/test/datas/dossier-dotation.data.mock";
import { entrepriseDossierDataMock } from "@/test/datas/dossier-entreprise.data.mock";
import { DsApiError } from "@dnum-mi/ds-api-client";

const dossierNotFoundGraphQlError = {
  data: null,
  errors: [
    {
      message: "Dossier not found",
      locations: [
        {
          line: 191,
          column: 5,
        },
      ],
      path: ["dossier"],
      extensions: {
        code: "not_found",
      },
    },
  ],
};

export const dsServiceMock = {
  getOneDossier: jest.fn().mockImplementation((id: number) => {
    if (id === 17) {
      return dotationDossierDataMock;
    } else if (id === 65) {
      return entrepriseDossierDataMock;
    } else if (id === 37) {
      return {
        champs: [null, null],
        demarche: { title: "Fake title" },
        instructeurs: [
          {
            id: "SW5zdHJ1Y3RldXItNA==",
            email: "yoyo@gmail.com",
          },
        ],
      };
    } else throw new DsApiError(dossierNotFoundGraphQlError);
  }),
  writeRnfIdInPrivateAnnotation: jest.fn().mockResolvedValue(undefined),
};
