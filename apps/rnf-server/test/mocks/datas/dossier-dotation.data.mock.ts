/* eslint-disable */
import { Dossier } from "@dnum-mi/ds-api-client";

export const dotationDossierDataMock = {
  id: "RG9zc2llci0xNw==",
  number: 17,
  archived: false,
  state: "sans_suite",
  dateDerniereModification: "2022-12-05T16:34:36+01:00",
  dateDepot: "2022-10-19T10:17:20+02:00",
  datePassageEnConstruction: "2022-10-19T10:17:20+02:00",
  datePassageEnInstruction: "2022-11-22T13:26:33+01:00",
  dateTraitement: "2022-12-05T16:34:35+01:00",
  dateExpiration: "2023-12-05T16:34:35+01:00",
  dateSuppressionParUsager: null,
  motivation: "Délais d'envoi de document expiré ",
  motivationAttachment: null,
  attestation: null,
  pdf: {
    filename: "dossier-17.pdf",
    contentType: "application/pdf",
    checksum: "",
    byteSize: "0",
    url: "https://fakeurl/api/v2/dossiers/pdf/BAh7CEkiCGdpZAY6BkVUSSIpZ2lkOi8vdHBzL0Rvc3NpZXIvMTc_ZXhwaXJlc19pbj0zNjAwBjsAVEkiDHB1cnBvc2UGOwBUSSILYXBpX3YyBjsAVEkiD2V4cGlyZXNfYXQGOwBUSSIdMjAyMy0wNi0wNFQxMDo1MDo0MC4xNTlaBjsAVA==--f4fe65b24aba7e07eef4ae83d6c7b2ebf5fcc468",
  },
  usager: {
    email: "toto@gmail.com",
  },
  groupeInstructeur: {
    id: "R3JvdXBlSW5zdHJ1Y3RldXItNw==",
    number: 7,
    label: "00 - BAF",
    instructeurs: [
      {
        id: "SW5zdHJ1Y3RldXItNA==",
        email: "toto@gmail.com",
      },
      {
        id: "SW5zdHJ1Y3RldXItMg==",
        email: "titi@gmail.com",
      },
    ],
  },
  demandeur: {
    __typename: "PersonnePhysique",
    civilite: "Mme",
    nom: "Benoit",
    prenom: "Bob",
  },
  demarche: {
    revision: {
      id: "UHJvY2VkdXJlUmV2aXNpb24tMTI=",
    },
    id: "UHJvY2VkdXJlLTc=",
    number: 37,
    title: "Création d'un fonds de dotation(national)",
    description:
      "Le fonds de dotation est une personne morale de droit privé à but non lucratif qui reçoit et gère, en les capitalisant, des biens et droits de toute nature qui lui sont apportés à titre gratuit et irrévocable et utilise les revenus de la capitalisation en vue de la réalisation d'une œuvre ou d'une mission d'intérêt général ou les redistribue pour assister une personne morale à but non lucratif dans l'accomplissement de ses œuvres et de ses missions d'intérêt général\r\n\r\nSeuls les fonds de dotation fixant leur siège à Paris peuvent utiliser ce téléservice.\r\n\r\nSeules les personnes fondatrices ou mandatées par elles peuvent procéder à cette déclaration.",
    state: "publiee",
    declarative: null,
    dateCreation: "2022-10-17T11:32:12+02:00",
    datePublication: "2022-10-17T17:17:36+02:00",
    dateDerniereModification: "2023-05-09T11:18:10+02:00",
    dateDepublication: null,
    dateFermeture: null,
    notice: null,
    deliberation: null,
    demarcheUrl: "https://fakeurl/commencer/creation-d-un-fonds-de-dotation-national",
    cadreJuridiqueUrl: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000020248565",
  },
  instructeurs: [
    {
      id: "SW5zdHJ1Y3RldXItNA==",
      email: "toto@gmail.com",
    },
  ],
  traitements: [
    {
      state: "en_construction",
      emailAgentTraitant: null,
      dateTraitement: "2022-10-19T10:17:20+02:00",
      motivation: null,
    },
    {
      state: "en_instruction",
      emailAgentTraitant: "toto@gmail.com",
      dateTraitement: "2022-11-22T13:26:33+01:00",
      motivation: null,
    },
    {
      state: "sans_suite",
      emailAgentTraitant: "toto@gmail.com",
      dateTraitement: "2022-12-05T16:34:35+01:00",
      motivation: "Délais d'envoi de document expiré ",
    },
  ],
  champs: [
    {
      id: "Q2hhbXAtODk=",
      __typename: "TextChamp",
      label: "Titre, adresse et durée du fonds de dotation",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTA=",
      __typename: "TextChamp",
      label: "Titre du fonds de dotation (suivi du sigle s'il existe)",
      stringValue: "Je suis un titre compliqué avec des espaces et des accents et des MajUsCules",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem #rnf-titre-rnf#ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTE=",
      __typename: "AddressChamp",
      label: "Adresse du siège social du fonds de dotation",
      stringValue: "11 Rue Pelleport 33800 Bordeaux",
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
      commune: {
        name: "Bordeaux",
        code: "33063",
        postalCode: "33800",
      },
      departement: {
        name: "Gironde",
        code: "33",
      },
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lo#rnf-addresse-rnf#rem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTI=",
      __typename: "TextChamp",
      label: "Courriel du fonds de dotation",
      stringValue: "tata@gmail.com",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "#rnf-courriel-rnf#lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTM=",
      __typename: "TextChamp",
      label: "Numéro de téléphone du fonds de dotation",
      stringValue: "06 86 46 54 45",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum#rnf-telephone-rnf#",
      },
    },
    {
      id: "Q2hhbXAtOTQ=",
      __typename: "MultipleDropDownListChamp",
      label: "Durée d'existence du fonds de dotation",
      stringValue: "Durée indéterminée",
      values: ["Durée indéterminée"],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTU=",
      __typename: "IntegerNumberChamp",
      label: "Durée d'existence (en nombre d'années)",
      stringValue: "5",
      integerNumber: "5",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTY=",
      __typename: "TextChamp",
      label: "Administrateurs/administratrices du fond de dotation",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTc=",
      __typename: "PieceJustificativeChamp",
      label: "Pièce à déposer : liste des administrateurs",
      stringValue: "",
      files: [
        {
          filename: "FD- membres de l'administration.xlsx",
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          checksum: "8TO1IlXVREyn8o5G1GK2Aw==",
          byteSize: "10350",
          url: "https://fakeurl/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhMk5tWjNWa2FUTnNkVGN4ZUhObk1UVTFkakZ3WW05aU5XUjROZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVh4aGRIUmhZMmh0Wlc1ME95Qm1hV3hsYm1GdFpUMGlSa1F0SUcxbGJXSnlaWE1nWkdVZ2JDVXlOMkZrYldsdWFYTjBjbUYwYVc5dUxuaHNjM2dpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBaRUxTVXlNRzFsYldKeVpYTWxNakJrWlNVeU1Hd2xNamRoWkcxcGJtbHpkSEpoZEdsdmJpNTRiSE40QmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NKR1lYQndiR2xqWVhScGIyNHZkbTVrTG05d1pXNTRiV3htYjNKdFlYUnpMVzltWm1salpXUnZZM1Z0Wlc1MExuTndjbVZoWkhOb1pXVjBiV3d1YzJobFpYUUdPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6IjIwMjMtMDYtMDRUMTA6NTA6NDAuMzAzWiIsInB1ciI6ImJsb2Jfa2V5In19--307af1da1bc99a172b726d3b41e482132c11ff75/FD-%20membres%20de%20l'administration.xlsx",
        },
      ],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTg=",
      __typename: "TextChamp",
      label: "Objet et statuts du fonds de dotation",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtOTk=",
      __typename: "TextChamp",
      label: "Explication",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTAw",
      __typename: "TextChamp",
      label: "Objet du fonds de dotation",
      stringValue: "L'objet du fonds de dotation",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTAx",
      __typename: "MultipleDropDownListChamp",
      label: "Caractère(s) d'intérêt général, au sens de la loi, poursuivi(s) par votre fonds de dotation",
      stringValue: "Familial",
      values: ["Familial"],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTAy",
      __typename: "MultipleDropDownListChamp",
      label: "Thème(s) de l'objet du fonds de dotation",
      stringValue: "Éducation, formation",
      values: ["Éducation, formation"],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTAz",
      __typename: "PieceJustificativeChamp",
      label: "Pièce à déposer : statuts proposés",
      stringValue: "",
      files: [],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTA0",
      __typename: "TextChamp",
      label: "Modalités d'action du fonds de dotation",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTA1",
      __typename: "TextChamp",
      label: "Nature de la dotation",
      stringValue: "Consomptible",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTA2",
      __typename: "TextChamp",
      label: "Actions du fonds de dotation",
      stringValue: "Mixte",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTA4",
      __typename: "CheckboxChamp",
      label: "Le fonds de dotation envisage-t-il de financer des actions ou des organismes dont le siège n'est pas en France ?",
      stringValue: "false",
      checked: false,
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTA3",
      __typename: "TextChamp",
      label: "Déclarant",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTA5",
      __typename: "TextChamp",
      label: "Qualité du déclarant",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTEw",
      __typename: "PieceJustificativeChamp",
      label: "Le mandat de l'un des fondateurs du fonds de dotation",
      stringValue: "",
      files: [],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTEx",
      __typename: "TextChamp",
      label: "Numéro de téléphone du déclarant",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTEy",
      __typename: "TextChamp",
      label: "Publication au journal officiel",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTEz",
      __typename: "PieceJustificativeChamp",
      label: "Formulaire de publication au JO",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      files: [
        {
          filename: "FD- membres de l'administration-1.xlsx",
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          checksum: "A/1sj/QKvsQHNf2qO7UY9A==",
          byteSize: "10466",
          url: "https://fakeurl.rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhNRGRwT1hWaWQzTnZaSFpwWW1ZMGRqSmhNR1owTWpsbmVXdDFhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlCaGRIUmhZMmh0Wlc1ME95Qm1hV3hsYm1GdFpUMGlSa1F0SUcxbGJXSnlaWE1nWkdVZ2JDVXlOMkZrYldsdWFYTjBjbUYwYVc5dUxURXVlR3h6ZUNJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblJrUXRKVEl3YldWdFluSmxjeVV5TUdSbEpUSXdiQ1V5TjJGa2JXbHVhWE4wY21GMGFXOXVMVEV1ZUd4emVBWTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lSbUZ3Y0d4cFkyRjBhVzl1TDNadVpDNXZjR1Z1ZUcxc1ptOXliV0YwY3kxdlptWnBZMlZrYjJOMWJXVnVkQzV6Y0hKbFlXUnphR1ZsZEcxc0xuTm9aV1YwQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjoiMjAyMy0wNi0wNFQxMDo1MDo0MC4zMDdaIiwicHVyIjoiYmxvYl9rZXkifX0=--85853d7c523ab2d00772664d0aa2ef5722843c35/FD-%20membres%20de%20l'administration-1.xlsx",
        },
      ],
    },
    {
      id: "Q2hhbXAtMTE0",
      __typename: "DepartementChamp",
      label: "Préfecture de déclaration",
      stringValue: "75 - Paris",
      departement: {
        name: "Paris",
        code: "75",
      },
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTE1",
      __typename: "TextChamp",
      label: "Pièce(s) justificative(s) supplémentaire(s)",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTE2",
      __typename: "PieceJustificativeChamp",
      label: "Autre(s) pièce(s) à transmettre",
      stringValue: "",
      files: [],
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
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
  ],
  annotations: [
    {
      id: "Q2hhbXAtMTE4",
      __typename: "TextChamp",
      label: "N° unique de l'organisme",
      stringValue: "",
    },
  ],
} as unknown as Partial<Dossier>;
