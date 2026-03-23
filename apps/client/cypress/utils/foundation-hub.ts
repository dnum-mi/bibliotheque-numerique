import { fakerFR as faker } from '@faker-js/faker'

const getAddress = () => ({
  'oneLine': faker.location.streetAddress({ useFullAddress: true }),
  'coordinates': faker.location.nearbyGPSCoordinate(),
  'dsAddress': {
    'label': faker.location.streetAddress(),
    'type': 'housenumber',
    'streetAddress': faker.location.streetAddress(),
    'streetNumber': faker.location.buildingNumber(),
    'streetName': faker.location.street(),
    'countryCode': 'FR',
    'countryName': 'France',
    'postalCode': faker.location.zipCode(),
    'cityName': faker.location.city(),
    'cityCode': faker.location.zipCode(),
    'departmentName': faker.location.state(),
    'departmentCode': faker.string.numeric({ length: { min: 0, max: 2 } }),
    'regionName': faker.location.state(),
    'regionCode': faker.string.numeric({ length: { min: 0, max: 2 } }),
  },
})

const getLabelFile = () => faker.helpers.arrayElement(['Statuts_initiaux'])
const getTypeFile = () => faker.helpers.arrayElement(['Statuts', 'PV'])
const getFile = () => ({
  'id': faker.string.uuid(),
  'name': getLabelFile(),
  'originalName': faker.system.fileName(),
  'checksum': '14Ma7iJwsomWTcO1WUZ6JQ==',
  'byteSize': faker.number.int(5),
  'mimeType': 'application/pdf',
  'prefixS3': faker.string.alpha(5),
  'uploadedAt': faker.date.past(),
  'typeFile': getTypeFile(),
  'effectiveAt': faker.date.past(),
})
const getProfession = () => faker.helpers.arrayElement(['expert-comptable', 'avocat', 'developpeur'])
const getQuality = () => faker.helpers.arrayElement(['Membre du conseil d\'administration'])
const getJobPosition = () => faker.helpers.arrayElement(['Trésorier'])
const getTypeEvent = () => faker.helpers.arrayElement(['dsCreation', 'dsModification'])

const getEvent = () => ({
  'id': faker.string.uuid(),
  'type': getTypeEvent(),
  'createdAt': faker.date.past(),
  'joPublishedAt': null,
  'demarcheName': faker.lorem.words({ min: 1, max: 5 }),
  'demarcheNumber': faker.number.int({ min: 0, max: 100000 }),
  'dossierNumber.': faker.number.int({ min: 0, max: 100000 }),
  'isDissolution': false,
  'dossierInstructeurGroup': `${faker.string.numeric({ length: { min: 1, max: 3 } })} - ${faker.location.state()}`,
  'organismeBefore': {},
})

const getFondationNumber = () => `${faker.string.numeric(3)}-${faker.string.alpha(3)}-${faker.string.numeric(5)}-${faker.string.numeric(2)}`
const getAssoiciationNumber = () => `W${faker.string.numeric(9)}`
const getSiretNumber = () => faker.string.numeric(14)
export const getLegalEntityTypeFondtion = () => ({
  type: 'Fondation',
  publicId: getFondationNumber(),
  address: getAddress(),
  country: 'France',
  name: faker.company.name,
})
export const getLegalEntityTypeAssociation = () => ({
  type: 'Association',
  publicId: getAssoiciationNumber(),
  address: getAddress(),
  country: 'France',
  name: faker.company.name(),
})
export const getLegalEntityTypeEntreprise = () => ({
  type: 'Entreprise',
  publicId: getSiretNumber(),
  address: getAddress(),
  country: 'France',
  name: faker.company.name(),
})
export const getLegalEntityTypeAutre = () => ({
  type: 'Autre',
  publicId: '',
  address: getAddress(),
  country: 'France',
  name: faker.company.name(),
})
const getLegalEntity = () => {
  return faker.helpers.arrayElement([
    getLegalEntityTypeFondtion(),
    getLegalEntityTypeAssociation(),
    getLegalEntityTypeEntreprise(),
    getLegalEntityTypeAutre(),
    null,
  ])
}
export const getFoundation = (args: {
  nbPerson: {
    min: number | undefined,
    max: number | undefined,
  } | undefined
}) => ({
  'hub_timestamp': faker.date.past().toISOString(),
  'createdAt': faker.date.past().toISOString(),
  'updatedAt': faker.date.past().toISOString(),
  'id': getFondationNumber(),
  'state': 'Active',
  'stateEffectiveAt': faker.date.past().toISOString(),
  'siret': getSiretNumber(),
  'title': faker.company.name(),
  'email': faker.internet.email(),
  'phone': faker.phone.number(),
  'website': faker.internet.url(),
  'foundationType': faker.string.alpha(3),
  'department': faker.string.numeric({ length: { min: 0, max: 3 } }),
  'creationAt': faker.date.past(),
  'address': getAddress(),
  'socialObject': faker.company.catchPhraseDescriptor(),
  'fiscalEndAt': faker.date.past().toISOString(),
  'publicGenerosityYears': [],
  'publicSubsidyYears': [],
  'foreignFinancingYears': [],
  'accountDepositYears': [],
  'persons': Array.from(
    { length: faker.number.int({ min: args?.nbPerson?.min ?? 0, max: args?.nbPerson?.max ?? 10 }) },
    () => ({
      'civility': null,
      'lastName': faker.person.lastName(),
      'firstName': faker.person.firstName(),
      'email': faker.internet.email(),
      'phone': faker.phone.number(),
      'profession': getProfession(),
      'nationality': 'France',
      'bornAt': faker.date.past(),
      'bornPlace': faker.location.country(),
      'isFounder': faker.datatype.boolean(),
      'quality': getQuality(),
      'address': getAddress(),
      'residenceCountry': 'France',
      'entryAt': faker.date.past(),
      'exitAt': null,
      'jobPosition': getJobPosition(),
      'legalEntity': getLegalEntity(),
    }),
  ),
  'dueDate': null,
  'generalInterestDomain': faker.company.buzzPhrase(),
  'hasInternationalActivity': faker.datatype.boolean(),
  'files': Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, getFile),
  'fromLineage': null,
  'toLineage': null,
  'events': Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, getEvent),
})
