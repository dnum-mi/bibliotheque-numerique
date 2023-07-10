import { faker } from '@faker-js/faker/locale/fr'

const getStateDossier = () => { return faker.helpers.arrayElement(['accepte', 'en_construction', 'en_instruction']) }
const getTypeDemandeur = () => { return faker.helpers.arrayElement(['PersonneMorale', 'PersonnePhysique']) }

export const getChamps = () => {
  return Array(faker.datatype.number({ min: 1, max: 20 })).fill({}).map(() => ({
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

export const getDemandeurMorale = () => ({
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
    departmentName: faker.address.state(),
    departmentCode: faker.address.zipCode(),
    regionName: faker.address.state(),
    regionCode: faker.address.zipCode(),
  },
  entreprise: {
    siren: faker.random.numeric(14),
    capitalSocial: faker.finance.account(),
    numeroTvaIntracommunautaire: `FR${faker.random.numeric(14)}`,
    formeJuridique: faker.lorem.word(),
    formeJuridiqueCode: faker.random.numeric(4),
    nomCommercial: faker.company.name(),
    raisonSociale: faker.company.name(),
    siretSiegeSocial: faker.random.numeric(14),
    codeEffectifEntreprise: '01',
    dateCreation: faker.date.past().toISOString(),
    nom: faker.name.lastName(),
    prenom: faker.name.firstName(),
    // TODO: A completer si besoin
    attestationFiscaleAttachment: null,
    // TODO: A completer si besoin
    attestationSocialeAttachment: null,
  },
  association: {
    dateCreation: faker.date.past().toDateString(),
    dateDeclaration: faker.date.past().toDateString(),
    datePublication: faker.date.past().toDateString(),
    objet: faker.company.catchPhrase(),
    rna: `W${faker.random.numeric(9)}`,
    titre: faker.company.name(),
  },
})

export const getDemandeurPhysique = () => ({
  civilite: faker.name.prefix(), // getCivilite(),
  dateDeNaissance: faker.date.past().toDateString(),
  nom: faker.name.lastName(),
  prenom: faker.name.firstName(),
})

export const generateDossierDSByTypeDemandeur = (__typename:string, demandeurTest: object) => ({
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
  instructeurs: Array(faker.datatype.number({ min: 1, max: 5 })).fill({}).map(() => ({
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
    ...Array(faker.datatype.number({ min: 1, max: 5 })).fill({}).map(() => ({
      state: getStateDossier(),
      emailAgentTraitant: faker.internet.email(),
      dateTraitement: faker.date.past().toISOString(),
      motivation: faker.lorem.paragraph(),
    })),
  ],
  champs: getChamps(),
  annotations: getChamps(),
  avis: [],
  messages: Array(faker.datatype.number({ min: 1, max: 5 })).fill({}).map(() => ({
    id: faker.datatype.string(20),
    email: faker.internet.email(),
    body: faker.lorem.paragraphs().split(faker.datatype.string(1)).join('<br><br>'),
    createdAt: faker.date.past().toISOString(),
  })),
  demandeur: {
    __typename,
    id: faker.random.numeric(),

    ...demandeurTest,
  },
})

export const generateDossierDS = () => {
  const __typename = getTypeDemandeur()
  const demandeurTest = __typename === 'PersonneMorale' ? getDemandeurMorale() : getDemandeurPhysique()

  return generateDossierDSByTypeDemandeur(__typename, demandeurTest)
}

export const generateDossierDSPersonneMorale = () => generateDossierDSByTypeDemandeur('PersonneMorale', getDemandeurMorale())
export const generateDossierDSPersonnePhysique = () => generateDossierDSByTypeDemandeur('PersonnePhysique', getDemandeurPhysique())

export const generateDossier = () => ({
  id: faker.random.numeric(),
  dossierDS: {
    dataJson: generateDossierDS(),
  },
  demarche: {
    title: faker.random.word(),
    typeOrganisme: faker.random.word(),
  },
})

export const generateDossiers = () => Array.from({ length: faker.datatype.number({ min: 1, max: 20 }) }, () => generateDossier())
