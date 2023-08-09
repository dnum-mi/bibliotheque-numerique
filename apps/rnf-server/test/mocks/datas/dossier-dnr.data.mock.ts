/* eslint-disable */
import { Dossier } from "@dnum-mi/ds-api-client";

export const dnrDossierDataMock = {
  id: "RG9zc2llci0xMzU=",
  number: 135,
  archived: false,
  state: "en_construction",
  dateDerniereModification: "2023-07-05T09:22:42+02:00",
  dateDepot: "2023-07-05T09:22:42+02:00",
  datePassageEnConstruction: "2023-07-05T09:22:42+02:00",
  datePassageEnInstruction: null,
  dateTraitement: null,
  dateExpiration: "2024-07-05T09:22:42+02:00",
  dateSuppressionParUsager: null,
  motivation: null,
  motivationAttachment: null,
  attestation: null,
  pdf: {
    filename: "dossier-135.pdf",
    contentType: "application/pdf",
    checksum: "",
    byteSize: "0",
    url: "https://51.159.112.103:3000/api/v2/dossiers/pdf/BAh7CEkiCGdpZAY6BkVUSSIqZ2lkOi8vdHBzL0Rvc3NpZXIvMTM1P2V4cGlyZXNfaW49MzYwMAY7AFRJIgxwdXJwb3NlBjsAVEkiC2FwaV92MgY7AFRJIg9leHBpcmVzX2F0BjsAVEkiHTIwMjMtMDctMDVUMDg6MjQ6NDkuMDY5WgY7AFQ=--51720d6f51f74426f7ef2007110a5b9e74cbd652",
  },
  usager: {
    email: "jojo@gmail.com",
  },
  groupeInstructeur: {
    id: "R3JvdXBlSW5zdHJ1Y3RldXItODgz",
    number: 883,
    label: "défaut",
    instructeurs: [
      {
        id: "SW5zdHJ1Y3RldXItNg==",
        email: "jojo@gmail.com",
      },
      {
        id: "SW5zdHJ1Y3RldXItNw==",
        email: "jojo@gmail.com",
      },
    ],
  },
  demandeur: {
    __typename: "PersonnePhysique",
    civilite: "M",
    nom: "DIDIER",
    prenom: "Robin",
  },
  demarche: {
    revision: {
      id: "UHJvY2VkdXJlUmV2aXNpb24tMTAw",
    },
    id: "UHJvY2VkdXJlLTQz",
    number: 43,
    title: "Demande d'identifiant RNF",
    description:
      "Le RNF est un identifiant unique permettant de gérer la vie administrative des organismes philanthropiques (fonds de dotation, fondations d'entreprise et fondations reconnues d'utilité publique).",
    state: "publiee",
    declarative: null,
    dateCreation: "2023-06-20T16:52:16+02:00",
    datePublication: "2023-07-05T09:20:44+02:00",
    dateDerniereModification: "2023-07-05T09:22:42+02:00",
    dateDepublication: null,
    dateFermeture: null,
    notice: null,
    deliberation: null,
    demarcheUrl: "https://51.159.112.103:3000/commencer/demande-d-identifiant-rnf",
    cadreJuridiqueUrl: "https://www.legifrance.gouv.fr/",
  },
  instructeurs: [
    {
      id: "SW5zdHJ1Y3RldXItNw==",
      email: "jojo@gmail.com",
    },
  ],
  traitements: [
    {
      state: "en_construction",
      emailAgentTraitant: null,
      dateTraitement: "2023-07-05T09:22:42+02:00",
      motivation: null,
    },
  ],
  champs: [
    {
      id: "Q2hhbXAtMTM2NQ==",
      __typename: "TextChamp",
      label: "Identifiant RNF",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM2Ng==",
      __typename: "CheckboxChamp",
      label: "Votre structure possède-t-elle déjà un identifiant RNF ?",
      stringValue: "false",
      checked: false,
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM2OA==",
      __typename: "TextChamp",
      label: "Type de structure",
      stringValue: "Fondation reconnue d'utilité publique (FRUP)",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "#rnf-type-rnf#lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM2OQ==",
      __typename: "DepartementChamp",
      label: "Siège de votre structure",
      stringValue: "59 - Nord",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
      departement: {
        name: "Nord",
        code: "59",
      },
    },
    {
      id: "Q2hhbXAtMTM3MA==",
      __typename: "TextChamp",
      label: "Titre de la structure",
      stringValue: "Fondation des tulipes",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum#rnf-titre-rnf#",
      },
    },
    {
      id: "Q2hhbXAtMTM3MQ==",
      __typename: "AddressChamp",
      label: "Adresse du siège social de la structure",
      stringValue: "3 Rue Colbert 59800 Lille",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum#rnf-addresse-rnf#",
      },
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
      commune: {
        name: "Lille",
        code: "59350",
        postalCode: "59800",
      },
      departement: {
        name: "Nord",
        code: "59",
      },
    },
    {
      id: "Q2hhbXAtMTM3Mg==",
      __typename: "TextChamp",
      label: "Courriel de contact de la structure",
      stringValue: "tulipe@gmail.com",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lo#rnf-courriel-rnf#rem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3Mw==",
      __typename: "TextChamp",
      label: "Téléphone contact de la structure",
      stringValue: "07 89 89 89 89",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "#rnf-telephone-rnf#lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3NA==",
      __typename: "TextChamp",
      label: "Déclarant pour la structure",
      stringValue: "",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3NQ==",
      __typename: "CiviliteChamp",
      label: "Civilité du déclarant",
      stringValue: "M.",
      civilite: "M",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3Ng==",
      __typename: "TextChamp",
      label: "Nom",
      stringValue: "DIDIER ",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3Nw==",
      __typename: "TextChamp",
      label: "Prénom",
      stringValue: "Robin",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3OA==",
      __typename: "TextChamp",
      label: "Adresse électronique du déclarant",
      stringValue: "jojo@gmail.com",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
    {
      id: "Q2hhbXAtMTM3OQ==",
      __typename: "TextChamp",
      label: "Numéro de téléphone du déclarant",
      stringValue: "06 89 89 89 89",
      // TODO: replace this with real value of getCustomChamp
      champDescriptor: {
        description: "lorem ipsum",
      },
    },
  ],
  annotations: [
    {
      id: "Q2hhbXAtMTQ3OQ==",
      __typename: "TextChamp",
      label: "Référence du fonds de dotation",
      stringValue: "",
    },
  ],
} as unknown as Partial<Dossier>;
