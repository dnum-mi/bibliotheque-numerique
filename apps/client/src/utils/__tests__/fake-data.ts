import { faker } from '@faker-js/faker/locale/fr'

export const getDateISO = () => faker.date.past().toDateString()
