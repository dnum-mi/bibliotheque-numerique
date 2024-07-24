/* eslint-disable */
import { Dossier } from "@dnum-mi/ds-api-client";

export const entrepriseDossierDataMock = {
  id: "RG9zc2llci02NQ==",
  number: 65,
  archived: false,
  state: "en_instruction",
  dateDerniereModification: "2023-01-04T13:18:13+01:00",
  dateDepot: "2023-01-04T13:17:50+01:00",
  datePassageEnConstruction: "2023-01-04T13:17:50+01:00",
  datePassageEnInstruction: "2023-01-04T13:18:13+01:00",
  dateTraitement: null,
  dateExpiration: null,
  dateSuppressionParUsager: null,
  motivation: null,
  motivationAttachment: null,
  attestation: null,
  pdf: {
    filename: "dossier-65.pdf",
    contentType: "application/pdf",
    checksum: "",
    byteSize: "0",
    url: "https://fakeurl/api/v2/dossiers/pdf/BAh7CEkiCGdpZAY6BkVUSSIpZ2lkOi8vdHBzL0Rvc3NpZXIvNjU_ZXhwaXJlc19pbj0zNjAwBjsAVEkiDHB1cnBvc2UGOwBUSSILYXBpX3YyBjsAVEkiD2V4cGlyZXNfYXQGOwBUSSIdMjAyMy0wNi0wNFQxMDo0NzozMy43MjlaBjsAVA==--c1449925772da6bb56ae3b19e664fad2cdc36cb8",
  },
  usager: {
    email: "titi@gmail.com",
  },
  groupeInstructeur: {
    id: "R3JvdXBlSW5zdHJ1Y3RldXItMTE3",
    number: 117,
    label: "00 - BAF",
    instructeurs: [
      {
        id: "SW5zdHJ1Y3RldXItNA==",
        email: "tata@gmail.com",
      },
      {
        id: "SW5zdHJ1Y3RldXItMg==",
        email: "titi@gmail.com",
      },
    ],
  },
  demandeur: {
    __typename: "PersonnePhysique",
    civilite: "M",
    nom: "CERTHOUX",
    prenom: "Rémi",
  },
  demarche: {
    revision: {
      id: "UHJvY2VkdXJlUmV2aXNpb24tNDU=",
    },
    id: "UHJvY2VkdXJlLTEy",
    number: 12,
    title: "Création d'une fondation d'entreprise (national)",
    description:
      "Les articles 19 à 19-12 de la loi n° 87-571 du 23 juillet 1987 sur le développement du mécénat organisent les règles relatives aux fondations d'entreprises.\r\n\r\nLa fondation d'entreprise est une personne morale de droit privé à but non lucratif qui reçoit et gère des biens et droits de toute nature qui lui sont apportés à titre gratuit et irrévocable et les utilise en vue de la réalisation d'une œuvre d'intérêt général.\r\n\r\nCette procédure permet de solliciter l'autorisation de création d'une fondation d'entreprise.\r\n\r\nSeules les fondations d'entreprise fixant leur siège à Paris  peuvent engager cette procédure dématérialisée.\r\n\r\nSeuls les fondateurs ou personnes mandatées par eux peuvent effectuer cette procédure.",
    state: "publiee",
    declarative: null,
    dateCreation: "2022-11-15T10:42:07+01:00",
    datePublication: "2022-11-16T15:26:56+01:00",
    dateDerniereModification: "2023-05-09T11:19:34+02:00",
    dateDepublication: null,
    dateFermeture: null,
    notice: null,
    deliberation: null,
    demarcheUrl: "https://fakeurl/commencer/creation-d-une-fondation-d-entreprise-national",
    cadreJuridiqueUrl: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT00000606901",
  },
  instructeurs: [
    {
      id: "SW5zdHJ1Y3RldXItMg==",
      email: "titi@gmail.com",
    },
  ],
  traitements: [
    {
      state: "en_construction",
      emailAgentTraitant: null,
      dateTraitement: "2023-01-04T13:17:50+01:00",
      motivation: null,
    },
    {
      state: "en_instruction",
      emailAgentTraitant: "titi@gmail.com",
      dateTraitement: "2023-01-04T13:18:13+01:00",
      motivation: null,
    },
  ],
  champs: [
    {
      id: "Q2hhbXAtMjkz",
      __typename: "TextChamp",
      label: "Titre et adresse de la fondation d'entreprise",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hTTXAtOTI=",
      __typename: "TextChamp",
      label: "Courriel du fonds d'entreprise",
      stringValue: "tata@gmail.com",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "#rnf-courriel-rnf#lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMjk0",
      __typename: "TextChamp",
      label: "Titre de la fondation d'entreprise",
      stringValue: "Test demo",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lo#rnf-titre-rnf#rem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTg1Mw==",
      __typename: "DepartementChamp",
      label: "Département du siège de votre structure :",
      stringValue: "59 - Nord",
      departement: {
        name: "Nord",
        code: "59",
      },
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum#rnf-departement-rnf#lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMjk1",
      __typename: "AddressChamp",
      label: "Adresse du siège social de la fondation d'entreprise",
      stringValue: "1 Square Wannoschot 59800 Lille",
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
      commune: {
        name: "Lille",
        code: "59350",
        postalCode: "59800",
      },
      departement: {
        name: "Nord",
        code: "59",
      },
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "#rnf-addresse-rnf#lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMjk2",
      __typename: "IntegerNumberChamp",
      label: "Durée d'existence (nombre d'années)",
      stringValue: "4",
      integerNumber: "4",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMjk3",
      __typename: "TextChamp",
      label: "Membres du conseil d'administration de la fondation d'entreprise",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMjk5",
      __typename: "RepetitionChamp",
      label: "Liste des structures fondatrices et leurs représentant.e.s",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      rows: [
        {
          champs: [
            {
              id: "Q2hhbXAtNTYx",
              __typename: "TextChamp",
              label: "Raison sociale de la personne morale, entreprise ou institution fondatrice",
              stringValue: "Demo Test",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTYy",
              __typename: "AddressChamp",
              label: "Adresse du siège social",
              stringValue: "1 Square Wannoschot 59800 Lille",
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
              commune: {
                name: "Lille",
                code: "59350",
                postalCode: "59800",
              },
              departement: {
                name: "Nord",
                code: "59",
              },
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTYz",
              __typename: "TextChamp",
              label: "Activités de la structure fondatrice ",
              stringValue: "Jeux",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTY0",
              __typename: "TextChamp",
              label: "Nom du représentant de l'entreprise ou institution fondatrice",
              stringValue: "Jean",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTY1",
              __typename: "TextChamp",
              label: "Prénom(s) du représentant de l'entreprise ou institution fondatrice",
              stringValue: "Louis",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTY3",
              __typename: "DateChamp",
              label: "Date de naissance du représentant de l'entreprise ou institution fondatrice",
              stringValue: "28 December 2022",
              date: "2022-12-28",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTY4",
              __typename: "TextChamp",
              label: "Lieu de naissance du représentant de l'entreprise ou institution fondatrice",
              stringValue: "Pairs",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTY5",
              __typename: "TextChamp",
              label: "Nationalité du représentant de l'entreprise ou institution fondatrice",
              stringValue: "Française",
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
            {
              id: "Q2hhbXAtNTcw",
              __typename: "AddressChamp",
              label: "Domicile du représentant de l'entreprise ou institution fondatrice",
              stringValue: "1 Square Wannoschot 59800 Lille",
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
              commune: {
                name: "Lille",
                code: "59350",
                postalCode: "59800",
              },
              departement: {
                name: "Nord",
                code: "59",
              },
              // TODO: replace this with real value of getCustomChamp
              champDescriptor: {
                description: "lorem ipsum",
              },
            },
          ],
        },
      ],
    },
    {
      id: "Q2hhbXAtMzAx",
      __typename: "TextChamp",
      label: "Objet et statuts de la fondation d'entreprise",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzAy",
      __typename: "TextChamp",
      label: "Explication",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzAz",
      __typename: "TextChamp",
      label: "Objet de la fondation d'entreprise",
      stringValue: "test",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzA0",
      __typename: "PieceJustificativeChamp",
      label: "Pièce à déposer : statuts proposés",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      files: [
        {
          filename: "database_models.pdf",
          contentType: "application/pdf",
          checksum: "felP3uQdb5TQ8Mg5WksQ6Q==",
          byteSize: "54254",
          url: "https://fakeurl/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbXgyTlhsemJqWnZNbmRyWW5GeWJXTXpZWEJuYzNCcGVHNWthZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SaGRHRmlZWE5sWDIxdlpHVnNjeTV3WkdZaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkoyUmhkR0ZpWVhObFgyMXZaR1ZzY3k1d1pHWUdPd1pVT2hGamIyNTBaVzUwWDNSNWNHVkpJaFJoY0hCc2FXTmhkR2x2Ymk5d1pHWUdPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6IjIwMjMtMDYtMDRUMTA6NDc6MzMuOTI2WiIsInB1ciI6ImJsb2Jfa2V5In19--f85b1f304bce1c6675f389294ba4afb02e9c4f4a/database_models.pdf",
        },
      ],
    },
    {
      id: "Q2hhbXAtMzA1",
      __typename: "MultipleDropDownListChamp",
      label: "Caractère(s) d'intérêt général, au sens de la loi poursuivi(s) par la fondation d'entreprise",
      stringValue: "Scientifique, Culturel",
      values: ["Scientifique", "Culturel"],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzA2",
      __typename: "MultipleDropDownListChamp",
      label: "Thème(s) de la fondation d'entreprise (champ dans lequel entre son objet)",
      stringValue: "Activités politiques",
      values: ["Activités politiques"],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzA3",
      __typename: "CheckboxChamp",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      label:
        "La fondation d'entreprise envisage-t-elle de financer des actions à l'international ou des organismes dont le siège n'est pas en France ?",
      stringValue: "false",
      checked: false,
    },
    {
      id: "Q2hhbXAtMzA4",
      __typename: "TextChamp",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      label: "Programme d'action pluriannuel de la fondation d'entreprise",
      stringValue: "",
    },
    {
      id: "Q2hhbXAtMzA5",
      __typename: "IntegerNumberChamp",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      label: "Montant total du programme d'action pluriannuel",
      stringValue: "3000",
      integerNumber: "3000",
    },
    {
      id: "Q2hhbXAtMzEw",
      __typename: "RepetitionChamp",
      label: "Contrat(s) de caution bancaire",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      rows: [
        {
          champs: [
            {
              id: "Q2hhbXAtMzEx",
              __typename: "PieceJustificativeChamp",
              label: "Pièce à déposer : contrat de caution bancaire",
              stringValue: "",
              files: [
                {
                  filename: "database_models.pdf",
                  contentType: "application/pdf",
                  checksum: "felP3uQdb5TQ8Mg5WksQ6Q==",
                  byteSize: "54254",
                  url: "https://fakeurl/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlV3RzWTNveWFqa3pjR05yYnpFNGJqWmtZWGw1ZW10NmIyaG1Nd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SaGRHRmlZWE5sWDIxdlpHVnNjeTV3WkdZaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkoyUmhkR0ZpWVhObFgyMXZaR1ZzY3k1d1pHWUdPd1pVT2hGamIyNTBaVzUwWDNSNWNHVkpJaFJoY0hCc2FXTmhkR2x2Ymk5d1pHWUdPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6IjIwMjMtMDYtMDRUMTA6NDc6MzMuOTM1WiIsInB1ciI6ImJsb2Jfa2V5In19--c8ec7dab9e16d6ca723f0527ad0823e12c74a344/database_models.pdf",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "Q2hhbXAtMzEy",
      __typename: "RepetitionChamp",
      label: "Le(s) ou les actes d'engagement du/des fondateurs relatif(s) au programme d'action pluriannuel",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      rows: [
        {
          champs: [
            {
              id: "Q2hhbXAtMzEz",
              __typename: "PieceJustificativeChamp",
              label: "Pièces à déposer : acte d'engagement",
              stringValue: "",
              files: [
                {
                  filename: "database_models.pdf",
                  contentType: "application/pdf",
                  checksum: "felP3uQdb5TQ8Mg5WksQ6Q==",
                  byteSize: "54254",
                  url: "https://fakeurl/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaemMyYlhSeGRYWTRhV28xTVhKNVltbDRNWFJ1ZG13M2JuQjRaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SaGRHRmlZWE5sWDIxdlpHVnNjeTV3WkdZaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkoyUmhkR0ZpWVhObFgyMXZaR1ZzY3k1d1pHWUdPd1pVT2hGamIyNTBaVzUwWDNSNWNHVkpJaFJoY0hCc2FXTmhkR2x2Ymk5d1pHWUdPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6IjIwMjMtMDYtMDRUMTA6NDc6MzMuOTM5WiIsInB1ciI6ImJsb2Jfa2V5In19--64627b7e6f0cffb7a061f84a9a56ae0de43f39e9/database_models.pdf",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "Q2hhbXAtMzE0",
      __typename: "TextChamp",
      label: "Déclarant",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzE1",
      __typename: "TextChamp",
      label: "Qualité du déclarant",
      stringValue: "Personne mandatée par les fondateurs",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMzE2",
      __typename: "PieceJustificativeChamp",
      label: "Le mandat de l'un des fondateurs de la fondation d'entreprise",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      stringValue: "",
      files: [],
    },
    {
      id: "Q2hhbXAtMzE3",
      __typename: "TextChamp",
      label: "Numéro de téléphone du déclarant",
      stringValue: "06 86 46 54 45",
      champDescriptor: {
        description: "lorem ipsum#rnf-telephone-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMzE4",
      __typename: "PieceJustificativeChamp",
      label: "Pièce(s) justificative(s) supplémentaire(s)",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      stringValue: "",
      files: [],
    },
    {
      id: "Q2hhbXAtMzE5",
      __typename: "TextChamp",
      label: "Publication Journal Officiel (JOAFE)",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      stringValue: "",
    },
    {
      id: "Q2hhbXAtMzIw",
      __typename: "DepartementChamp",
      label: "Préfecture de déclaration",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      stringValue: "75 - Paris",
      departement: {
        name: "Paris",
        code: "75",
      },
    },
    {
      id: "Q2hhbXAtMTE5MHwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Qualité du représentant",
      stringValue: "Représentant du fondateur",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-qualite-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5MHwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Civilite du représentant",
      stringValue: "M",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-civilite-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5MXwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Nom",
      stringValue: "JEAN",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-nom-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5MnwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Prénom",
      stringValue: "EVA",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-prenom-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5M3wwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "DateChamp",
      label: "Date de naissance",
      stringValue: "13 septembre 2023",
      date: "2023-09-13",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-date-naissance-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5NHwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Lieu de naissance du déclarant",
      stringValue: "PARIS",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-lieu-naissance-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5NXwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Nationalité",
      stringValue: "Aruba",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-nationalite-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5NnwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Profession",
      stringValue: "SDF",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-profession-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5N3wwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "AddressChamp",
      label: "Adresse",
      stringValue: "1 Square Rameau 59800 Lille",
      address: {
        label: "1 Square Rameau 59800 Lille",
        type: "housenumber",
        streetAddress:" 1 Square Rameau",
        streetNumber: "1",
        streetName: "Square Rameau",
        postalCode: "59800",
        cityName: "Lille",
        cityCode: "59350",
        departmentName: "Nord",
        departmentCode: "59",
        regionName: "Hauts-de-France",
        regionCode: "32"
      },
      champDescriptor: {
        description: "lorem ipsum#rnf-person-adresse-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTE5NnwwMUhCNzhWRzZDQk5FSzUxMUNDWTBOU05COA==",
      __typename: "TextChamp",
      label: "Telephone",
      stringValue: "0123456789",
      champDescriptor: {
        description: "lorem ipsum#rnf-person-telephone-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMzUw",
      __typename: "DateChamp",
      label: "Date de fin d'exercice",
      stringValue: "08 septembre 2023",
      date: "2023-09-08",
      champDescriptor: {
        description: "lorem ipsum#rnf-date-fin-exercice-rnf#",
      },

    },
  ],
  annotations: [
    {
      id: "Q2hhbXAtMzIx",
      __typename: "TextChamp",
      label: "Référence de la fondation d'entreprise",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtNTM2",
      __typename: "TextChamp",
      label: "Type d'organisme",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtNTM3",
      __typename: "TextChamp",
      label: "Délai d'instruction",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzIy",
      __typename: "TextChamp",
      label: "Recevabilité",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzIz",
      __typename: "CheckboxChamp",
      label: "Si le déclarant n'est pas l'un des fondateurs, un mandat a-t-il été déposé ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzI0",
      __typename: "TextChamp",
      label: "Mentions statutaires à vérifier",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzI1",
      __typename: "CheckboxChamp",
      label: "L'adresse du siège social est-elle dans une commune gérée par le service instructeur ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzI2",
      __typename: "TextChamp",
      label: "Analyse statutaire de la fondation d'entreprise",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzI3",
      __typename: "MultipleDropDownListChamp",
      label: "Quelle est la qualité des fondateurs ?",
      stringValue: "",
      values: [],
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzI4",
      __typename: "CheckboxChamp",
      label: "L'objet est-il précisément défini ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzI5",
      __typename: "TextChamp",
      label: "L'activité prévue est-elle d'intérêt général ?",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzMw",
      __typename: "CheckboxChamp",
      label: "Les statuts prévoient-ils les conditions de nomination des membres du conseil d'administration et leur renouvellement ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzMx",
      __typename: "CheckboxChamp",
      label:
        "Le conseil d'administration comporte-t-il 2/3 maximum de représentants des fondateurs et du personnel et 1/3 au moins de personnalités qualifiées ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzMy",
      __typename: "CheckboxChamp",
      label: "Les statuts comportent-ils uniquement les ressources prévues par la loi ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzMz",
      __typename: "CheckboxChamp",
      label: "Les statuts prévoient-ils le montant du programme d'action pluriannuel ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzM0",
      __typename: "CheckboxChamp",
      label: "En cas de versement pluriannuel, les statuts prévoient-ils le calendrier des versements ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzM1",
      __typename: "CheckboxChamp",
      label: "Les conditions de liquidation sont-elles conformes à la loi ?",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzM2",
      __typename: "TextChamp",
      label: "Observations concernant les risques présents dans le contrôle de cette fondation d'entreprise",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzM3",
      __typename: "TextChamp",
      label: "Décision",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzM4",
      __typename: "PieceJustificativeChamp",
      label: "Modèle d'arrêté de création",
      stringValue: "",
      files: [],
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzM5",
      __typename: "CheckboxChamp",
      label: "Faire signer l'arrêté",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQw",
      __typename: "DepartementChamp",
      label: "Département de l'autorité délivrant l'arrêté",
      stringValue: "",
      departement: null,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQx",
      __typename: "DateChamp",
      label: "Date de l'arrêté",
      stringValue: "",
      date: null,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQy",
      __typename: "CheckboxChamp",
      label: "Tamponner et dater les statuts",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQz",
      __typename: "CheckboxChamp",
      label: "Mise à jour du tableau de suivi",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQ0",
      __typename: "CheckboxChamp",
      label: "Transmission de l'arrêté et du formulaire DILA à la DLPAJ",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQ1",
      __typename: "DateChamp",
      label: "Date d'envoi pour publication à la DILA",
      stringValue: "",
      date: null,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQ2",
      __typename: "TextChamp",
      label: "Retour de transmission à la DILA",
      stringValue: "",
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQ3",
      __typename: "DateChamp",
      label: "Date de publication au JOAFE",
      stringValue: "",
      date: null,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtMzQ4",
      __typename: "CheckboxChamp",
      label: "Transmission de l'arrêté et des statuts tamponnés à l'usager",
      stringValue: "false",
      checked: false,
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtNTk5",
      __typename: "DateChamp",
      label: "Date d'autorisation",
      stringValue: "",
      date: null,
      champDescriptor: {
        description: "lorem ipsum",
      },

    },
    {
      id: "Q2hhbXAtNDM1NzM1Nw==",
      date: "2024-07-09",
      label: "Date de publication au JO du décret portant création",
      __typename: "DateChamp",
      stringValue: "09 juillet 2024",
      champDescriptor: {
          "id": "Q2hhbXAtNDM1NzM1Nw==",
          "type": "date",
          "label": "Date de publication au JO du décret portant création",
          "required": false,
          "__typename": "DateChampDescriptor",
          "description": "<!-- #rnf-date-creation-rnf# -->",
          "champDescriptors": null
      }
    },
  ],
} as unknown as Partial<Dossier>;
