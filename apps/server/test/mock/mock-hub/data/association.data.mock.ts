import { IRnaAdrgAddress, ISiafRnaOutput } from '@biblio-num/shared'
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
const address2 = addressFn()
const labelAddress2 = `${address2.housenumber} ${address2.street} ${address2.postcode} ${address2.city}`

export const associationHub: ISiafRnaOutput = {
  id: 'W123456789',
  title: 'Association Test' + faker.company.name(),
  titles: ['Association Test' + faker.company.name(), 'Association ' + faker.company.name()],
  emails: [faker.internet.email()],
  phones: [faker.phone.number()],
  websites: [faker.internet.url()],
  objetSocial: {
    description: faker.lorem.paragraph(),
    categories: [
      {
        code: `${faker.string.numeric(6)}`,
        descriptions: [faker.lorem.words(3), faker.lorem.words(3)],
      },
    ],
  },
  nature: faker.lorem.words(3),
  siret: faker.string.numeric(14),
  addresses: [
    {
      dsStringValue: labelAddress,
      coordinates: [faker.number.float({ max: 100, fractionDigits: 4 }), faker.number.float({ max: 100, fractionDigits: 4 })],
      gouvAddress: {
        label: labelAddress,
        id: null,
        housenumber: address.housenumber,
        name: `${address.housenumber} ${address.street}`,
        street: `${address.street}`,
        postcode: `${address.postcode}`,
        city: `${address.city}`,
        // cityCode: null,
        // district: null,
        context: 'Île-de-France',
        type: 'housenumber',
        banId: undefined,
        citycode: undefined,
      },
      rnaAddress: {
        kind: 'adrs',
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
      },
    },
    {
      dsStringValue: labelAddress2,
      coordinates: [faker.number.float({ max: 100, fractionDigits: 4 }), faker.number.float({ max: 100, fractionDigits: 4 })],
      gouvAddress: {
        label: labelAddress2,
        id: null,
        housenumber: address2.housenumber,
        name: `${address2.housenumber} ${address2.street}`,
        street: `${address2.street}`,
        postcode: `${address2.postcode}`,
        city: `${address2.city}`,
        // cityCode: null,
        // district: null,
        context: 'Île-de-France',
        type: 'housenumber',
        banId: undefined,
        citycode: undefined,
      },
      rnaAddress: {
        kind: 'adrg',
        address: {
          achemine: address2.city,
          codepostal: address2.postcode,
          declarant: 'null',
          complemid: null,
          complemgeo: null,
          libvoie: address2.street,
          distrib: null,
          pays: 'France',
        } as IRnaAdrgAddress,
      },
    }],
  rnaImportedAt: faker.date.past(),
  status: {
    file: {
      id: faker.string.uuid(),
      name: faker.system.fileName(),
      checksum: faker.string.hexadecimal({ length: 64 }),
      byteSize: faker.number.int({ max: 2000000 }),
      mimeType: faker.system.mimeType(),
      rnaFile: {
        uploadAt: faker.date.past(),
        typePiece: 'Statuts',
        typeRecepisse: null,
      },
    },
  },
  dissolved: {
    dissolvedAt: null,
    verbalProcess: undefined,
    mandatLetter: undefined,
    otherFiles: [],
  },
  files: [{
    id: faker.string.uuid(),
    name: faker.system.fileName(),
    checksum: faker.string.hexadecimal({ length: 64 }),
    byteSize: faker.number.int({ max: 2000000 }),
    mimeType: faker.system.mimeType(),
  }],
  directors: {
    file: {
      id: faker.string.uuid(),
      name: faker.system.fileName(),
      checksum: faker.string.hexadecimal({ length: 64 }),
      byteSize: faker.number.int({ max: 2000000 }),
      mimeType: faker.system.mimeType(),
      rnaFile: {
        uploadAt: faker.date.past(),
        typePiece: 'Liste dirigeants',
        typeRecepisse: null,
      },
    },
  },
  groupement: {
    type: 'FED',
    associations: ['W123456789', 'W987654321'],
  },
  updatedAt: faker.date.recent(),
  createdAt: faker.date.past(),
}
