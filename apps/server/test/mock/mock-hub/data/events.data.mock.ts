import { IDsEvent, IFoundationOutput } from '@biblio-num/shared'
import { fakerFR as faker } from '@faker-js/faker'

export const eventsMock = (id): IDsEvent<IFoundationOutput> => ({
  id: id,
  events: [
    {
      id: faker.string.uuid(),
      type: 'dsCreation',
      createdAt: faker.date.past(),
      demarcheName: faker.lorem.words({ min: 1, max: 5 }),
      dossierNumber: faker.number.int({ min: 0, max: 10 }),
      isDissolution: faker.datatype.boolean(),
      demarcheNumber: faker.number.int({ min: 0, max: 10 }),
      publishedJOAFAt: null,
      dossierInstructeurGroup: faker.lorem.words({ min: 1, max: 5 }),
    },
  ],
  last_event_date: faker.date.past(),
})
