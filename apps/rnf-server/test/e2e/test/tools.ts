import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { Foundation } from '@prisma/client'

const dumbFoundation = {
  rnfId: '033-FDD-000000-00',
  type: 'FDD',
  department: '33',
  title:
    'Je suis un titre compliqué avec des espaces et des accents et des MajUsCules',
  address: {
    create: {
      label: '2 place blanche lefebvre 75017 Paris',
      type: 'housenumber',
      streetAddress: '2 place blanche lefebvre',
      streetNumber: '1',
      streetName: 'place blanche lefebvre',
      postalCode: '75017',
      cityName: 'Paris',
      cityCode: '75017',
      departmentName: 'Ile-de-France',
      departmentCode: '33',
      regionName: 'Ile-de-France',
      regionCode: '75',
    },
  },
  email: 'super-foundation@email.com',
  phone: '+33102030405',
}

export const insertDumbFoundation = async (
  prisma: PrismaService,
  f?: Partial<Foundation>,
) => {
  return prisma.foundation.create({
    // @ts-expect-error not really important in test context
    data: {
      ...dumbFoundation,
      ...f,
    },
  })
}
