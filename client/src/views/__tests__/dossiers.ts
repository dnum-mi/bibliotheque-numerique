import { faker } from '@faker-js/faker'

const getStateDossier = () => { return faker.helpers.arrayElement(['accepte', 'en_construction', 'en_instruction']) }

const getChamps = () => {
  return Array(faker.datatype.number({ min: 1, max: 5 })).map(() => ({
    id: faker.datatype.string(20),
    label: faker.random.word(),
    stringValue: faker.random.words(),
  }))
}
const getTypeAddress = () => {
  return faker.helpers.arrayElement([
    'housenumber',
    'street',
    'municipality',
    'locality',
  ])
}

export const generateDossier = () => ({
  id: faker.datatype.string(20),
  number: faker.datatype.number(),
  archived: faker.datatype.boolean(),
  state: getStateDossier(),
  dateDerniereModification: faker.date.past().toISOString(),
  dateDepot: faker.date.past().toISOString(),
  datePassageEnConstruction: faker.date.past().toISOString(),
  datePassageEnInstruction: faker.date.past().toISOString(),
  dateTraitement: faker.date.past().toISOString(),
  motivation: faker.lorem.paragraph(),
  motivationAttachment: {
    filename: faker.system.fileName(),
    contentType: 'application/pdf',
    checksum: 'NuHflNIvs7CL5xm3MQMl6w==',
    byteSizeBigInt: faker.datatype.number(),
    url: faker.internet.url(),
  },
  attestation: null,
  pdf: {
    url: faker.internet.url(),
  },
  instructeurs: Array(faker.datatype.number({ min: 1, max: 5 })).map(() => ({
    email: faker.internet.email(),
  })),
  groupeInstructeur: {
    id: faker.datatype.string(20),
    number: faker.datatype.number(),
    label: faker.address.cityName(),
  },
  traitements: [
    {
      state: getStateDossier(),
      emailAgentTraitant: null,
      dateTraitement: faker.date.past().toISOString(),
      motivation: null,
    },
    ...Array(faker.datatype.number({ min: 1, max: 5 })).map(() => ({
      state: getStateDossier(),
      emailAgentTraitant: faker.internet.email(),
      dateTraitement: faker.date.past().toISOString(),
      motivation: faker.lorem.paragraph(),
    })),
  ],
  champs: getChamps(),
  annotations: getChamps(),
  avis: [],
  mesages: Array(faker.datatype.number({ min: 1, max: 5 })).map(() => ({
    id: faker.datatype.string(20),
    email: faker.internet.email(),
    body: faker.lorem.paragraphs(),
    createdAt: faker.date.past().toISOString(),
  })),
  demandeur: {
    siret: faker.random.numeric(14),
    siegeSocial: faker.datatype.boolean(),
    naf: `${faker.random.numeric(4)}${faker.random.alpha(1)}`,
    libelleNaf: faker.company.catchPhrase(),
    address: {
      label: faker.company.name(),
      type: getTypeAddress(),
      streetAddress: faker.address.streetAddress(),
      streetNumber: faker.address.street(),
      streetName: faker.address.streetName(),
      postalCode: faker.address.zipCode(),
      cityName: faker.address.cityName(),
      cityCode: faker.address.zipCode(),
      departmentName: null,
      departmentCode: null,
      regionName: null,
      regionCode: null,
    },
    entreprise: {
      siren: faker.random.numeric(14),
      capitalSocial: '-1',
      numeroTvaIntracommunautaire: `FR${faker.random.numeric(14)}`,
      formeJuridique: 'Fondation',
      formeJuridiqueCode: faker.random.numeric(4),
      nomCommercial: '',
      raisonSociale: faker.company.name(),
      siretSiegeSocial: faker.random.numeric(14),
      codeEffectifEntreprise: '01',
      dateCreation: faker.date.past().toISOString(),
      nom: null,
      prenom: null,
      attestationFiscaleAttachment: null,
      attestationSocialeAttachment: null,
    },
    association: null,
  },
})

export const generateDossiers = () => Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () => generateDossier())
