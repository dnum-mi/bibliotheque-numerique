import {
  assoQualityArray,
  IAssociationOutput,
  organismeStatusArray,
  prefixs3Array,
  typeFileArray,
} from '@biblio-num/shared'
import { fakerFR as faker } from '@faker-js/faker'

const addressFn = (): {
  housenumber: string
  street: string
  postcode: string
  city: string
  dep: string
} => ({
  housenumber: faker.location.buildingNumber(),
  // name:  `'3 Rue du Théâtre'`,
  street: faker.location.street(),
  postcode: faker.location.zipCode(),
  city: faker.location.city(),
  dep: faker.location.state(),
})
const address = addressFn()
const labelAddress = `${address.housenumber} ${address.street} ${address.postcode} ${address.city}`

export const associationHub: IAssociationOutput = {
  id: 'W123456789',
  title: 'Association Test' + faker.company.name(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  website: faker.internet.url(),
  address: {
    oneLine: labelAddress,
    coordinates: [faker.number.float({ max: 100, fractionDigits: 4 }), faker.number.float({ max: 100, fractionDigits: 4 })],
    dsAddress: null,
    rnaAddress: {
      address: {
        complement: null,
        numvoie: address.housenumber,
        repetition: null,
        typevoie: 'chemin',
        libvoie: address.street,
        distrib: null,
        codeinsee: faker.string.numeric(5),
        codepostal: address.postcode,
        libcommune: address.city,
      },
      gouvAddress: {
        label: labelAddress,
        id: null,
        housenumber: address.housenumber,
        name: `${address.housenumber} ${address.street}`,
        street: `${address.street}`,
        postcode: `${address.postcode}`,
        city: `${address.city}`,
        citycode: null,
        district: null,
        context: 'Île-de-France',
        type: 'housenumber',
      },
    },
  },
  files: Array.from({ length: 3 }, () => ({
    _id: faker.string.uuid(),
    _createdAt: faker.date.past(),
    _updatedAt: faker.date.past(),
    originalName: faker.system.fileName(),
    checksum: faker.string.alphanumeric({ length: 8 }),
    byteSize: faker.number.int({ max: 2000 }),
    mimeType: faker.system.mimeType(),
    name: faker.system.fileName(),
    uploadedAt: faker.date.past(),
    prefixS3: faker.helpers.arrayElement(prefixs3Array),
    typeFile: faker.helpers.arrayElement(typeFileArray),
    effectiveAt: faker.date.past(),
    rnaFile: null,
  })),
  _updatedAt: faker.date.recent(),
  _createdAt: faker.date.past(),
  // rnaImportedAt: faker.date.past(),
  activityDomainCode: faker.string.alpha({ length: 3 }),
  activityDomainDescription: faker.lorem.lines({ min: 1, max: 10 }),
  creationAt: faker.date.past(),
  department: faker.string.numeric({ length: 2 }),
  dueDate: faker.helpers.arrayElement([faker.date.recent(), null]),
  status: faker.helpers.arrayElement(organismeStatusArray),
  statusEffectiveAt: faker.date.past(),
  siret: faker.helpers.arrayElement([faker.string.numeric({ length: 14 }), null]),
  publicGenerosityYears: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.number.int({ min: 1970, max: 2025 })),
  publicSubsidyYears: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.number.int({ min: 1970, max: 2025 })),
  foreignFinancingYears: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.number.int({ min: 1970, max: 2025 })),
  quality: faker.helpers.arrayElement([
    {
      endedAt: faker.date.recent(),
      startedAt: faker.date.past(),
      type: faker.helpers.arrayElement(assoQualityArray),
    },
    null]),
  socialObject: faker.lorem.lines({ min: 1, max: 10 }),
  acquiredEstablishments: null,
  accountDepositYears: null,
  cededEstablishments: null,
  events: null,
  foundedLegalEntities: null,
  founderLegalEntities: null,
  fromLineage: null,
  fiscalEndAt: null,
  governanceLegalEntities: null,
  hasInternationalActivity: null,
  persons: [],
  rnaEvents: null,
  secondaryEstablishments: null,
  toLineage: null,
  union: null,
}
