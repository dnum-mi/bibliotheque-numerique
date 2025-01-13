import type { Demandeur, DossierStateKeys, IDossier, IOrganisme, TDossier } from '@biblio-num/shared'
import { faker } from '@faker-js/faker/locale/fr'

const getStateDossier = (): DossierStateKeys => faker.helpers.arrayElement(['accepte', 'en_construction', 'en_instruction'])
const getTypeDemandeur = () => faker.helpers.arrayElement(['PersonneMorale', 'PersonnePhysique'])

export const getChamps = () => {
  return Array(faker.number.int({ min: 1, max: 20 })).fill({}).map(() => ({
    id: faker.string.nanoid(20),
    label: faker.lorem.word(),
    stringValue: faker.lorem.words(),
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
  siret: faker.string.numeric(14),
  siegeSocial: faker.datatype.boolean(),
  naf: `${faker.string.numeric(4)}${faker.string.alpha(1)}`,
  libelleNaf: faker.company.catchPhrase(),
  address: {
    label: faker.company.name(),
    type: getTypeAddress(),
    streetAddress: faker.location.streetAddress(),
    streetNumber: faker.location.street(),
    streetName: faker.location.street(),
    postalCode: faker.location.zipCode(),
    cityName: faker.location.city(),
    cityCode: faker.location.zipCode(),
    departmentName: faker.location.state(),
    departmentCode: faker.location.zipCode(),
    regionName: faker.location.state(),
    regionCode: faker.location.zipCode(),
  },
  entreprise: {
    siren: faker.string.numeric(14),
    capitalSocial: faker.finance.accountNumber(),
    numeroTvaIntracommunautaire: `FR${faker.string.numeric(14)}`,
    formeJuridique: faker.lorem.word(),
    formeJuridiqueCode: faker.string.numeric(4),
    nomCommercial: faker.company.name(),
    raisonSociale: faker.company.name(),
    siretSiegeSocial: faker.string.numeric(14),
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
    rna: `W${faker.string.numeric(9)}`,
    titre: faker.company.name(),
  },
})

export const getDemandeurPhysique = () => ({
  civilite: faker.person.prefix(), // getCivilite(),
  dateDeNaissance: faker.date.past().toDateString(),
  nom: faker.person.lastName(),
  prenom: faker.person.firstName(),
})

export const generateDossierDSByTypeDemandeur = (__typename: string, demandeurTest: Demandeur): TDossier => ({
  id: faker.string.alpha(20),
  number: faker.number.int(),
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
    byteSizeBigInt: faker.number.bigInt(),
    url: faker.internet.url(),
  },
  attestation: null,
  pdf: {
    url: faker.internet.url(),
  },
  instructeurs: Array(faker.number.int({ min: 1, max: 5 })).fill({}).map(() => ({
    email: faker.internet.email(),
  })),
  groupeInstructeur: {
    id: faker.string.numeric(20),
    number: faker.number.int(),
    label: faker.location.city(),
  },
  traitements: [
    {
      state: getStateDossier(),
      emailAgentTraitant: null,
      dateTraitement: faker.date.past().toISOString(),
      motivation: null,
    },
    ...Array(faker.string.numeric(1)).fill('').map(() => ({
      state: getStateDossier(),
      emailAgentTraitant: faker.internet.email(),
      dateTraitement: faker.date.past().toISOString(),
      motivation: faker.lorem.paragraph(),
    })),
  ],
  champs: getChamps(),
  annotations: getChamps(),
  avis: [],
  messages: Array(faker.string.numeric({ min: 1, max: 5 })).fill({}).map(() => ({
    id: faker.string.numeric(20),
    email: faker.internet.email(),
    body: faker.lorem.paragraphs().split(faker.string.alpha(1)).join('<br><br>'),
    createdAt: faker.date.past().toISOString(),
  })),
  demandeur: {
    __typename,
    id: faker.string.numeric(),

    ...demandeurTest,
  },
})

export const generateDossierDS = (): TDossier => {
  const __typename = getTypeDemandeur()
  const demandeurTest = __typename === 'PersonneMorale' ? getDemandeurMorale() : getDemandeurPhysique()

  return generateDossierDSByTypeDemandeur(__typename, demandeurTest)
}

export const generateDossierDSPersonneMorale = () => generateDossierDSByTypeDemandeur('PersonneMorale', getDemandeurMorale())
export const generateDossierDSPersonnePhysique = () => generateDossierDSByTypeDemandeur('PersonnePhysique', getDemandeurPhysique())
export const getRandomOrganismeType = () => faker.helpers.arrayElement(['unknown', 'FDD', 'FE', 'FRUP', 'ARUP', 'CULTE'])
export const generateOrganisme = (): IOrganisme => ({
  id: faker.number.int(),
  title: faker.company.name(),
  type: getRandomOrganismeType(),
  idRna: null,
  rnaJson: null,
  idRnf: null,
  rnfJson: null,
  addressCityName: faker.location.city(),
  addressDepartmentName: faker.string.numeric(2),
  addressDepartmentCode: faker.string.numeric(2),
  addressLabel: faker.location.streetAddress(),
  addressPostalCode: faker.location.zipCode(),
  addressRegionName: faker.location.state(),
  addressRegionCode: faker.string.numeric(2),
  addressStreetAddress: faker.location.streetAddress(),
  addressStreetName: faker.location.street(),
  addressStreetNumber: faker.string.numeric({ length: { min: 1, max: 3 } }),
  addressType: faker.helpers.arrayElement(['housenumber', 'street', 'municipality', 'locality']),
  email: faker.internet.email(),
  phoneNumber: faker.phone.number(),
  dateCreation: new Date(faker.date.past().toISOString()),
  dateDissolution: null,
})

export const generateDossier = (): IDossier & { organisme: IOrganisme } => ({
  id: +faker.string.numeric({ length: { min: 2, max: 5 } }),
  dsDataJson: generateDossierDS(),
  demarche: {
    title: faker.word.noun(),
  },
  organisme: generateOrganisme(),
})

export const generateDossiers = () => Array.from({ length: faker.number.int({ min: 1, max: 20 }) }, () => generateDossier())

export const statusDictionary = {
  accepte: 'Accepté',
  en_construction: 'En construction',
  en_instruction: 'En instruction',
  refuse: 'Refusé',
  sans_suite: 'Sans suite',
} as const
