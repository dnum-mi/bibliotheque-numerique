import { ISiafRnfOutput } from '@biblio-num/shared'
import { IFile } from '@biblio-num/shared/types/organismes/siaf/siaf-common-output.interface'
import { fakerFR as faker } from '@faker-js/faker'

const address = {
  housenumber: faker.location.buildingNumber(),
  // name:  `'3 Rue du Théâtre'`,
  street: faker.location.street(),
  postcode: faker.location.zipCode(),
  city: faker.location.city(),
  dep: faker.location.state(),
}
const labelAddress = `${address.housenumber} ${address.street} ${address.postcode} ${address.city}`
export const foundationHub: ISiafRnfOutput = {
  id: '486-FRUP-01051-02',
  title: 'Fondation Test' + faker.company.name(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  websites: [faker.internet.url()],
  foundationType: 'FRUP',
  department: '986',
  originalDepartment: '986',
  originalCreatedAt: faker.date.past(),
  dissolved: {
    dissolvedAt: null,
    verbalProcess: {} as IFile,
    mandatLetter: {} as IFile,
    otherFiles: [],
  },
  status: {
    file: {
      id: faker.string.uuid(),
      name: faker.system.fileName(),
      checksum: '2qVOGXUEJ2b89a/fsOQchQ==',
      byteSize: faker.number.int({ max: 2000000 }),
      mimeType: faker.system.mimeType(),
      // rnaFile: {},
    },
  },
  address: {
    dsStringValue: labelAddress,
    coordinates: [2.284422, 48.85054],
    dsAddress: {
      label: labelAddress,
      type: 'housenumber',
      streetAddress: `${address.housenumber} ${address.street}`,
      streetNumber: `${address.housenumber}`,
      streetName: `${address.street}`,
      postalCode: `${address.postcode}`,
      cityName: `${address.city}`,
      cityCode: `${address.postcode}`,
      departmentName: address.dep,
      departmentCode: address.postcode.substring(0, 2),
      regionName: 'Île-de-France',
      regionCode: '11',
    },
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
  },
  fiscalEndDateAt: faker.date.past(),
  declarationYears: [],
  persons: [
  ],
  objectDescription: faker.lorem.lines(2),
  dueDate: faker.date.past(),
  generalInterest: 'Culturel, Mise en valeur du patrimoine artistique, Social',
  internationalAction: false,
  createdAt: new Date('2025-06-26T12:34:31.335Z'),
  updatedAt: new Date('2025-06-26T12:34:31.335Z'),
  // previous_versions: [],
}
