import { faker } from '@faker-js/faker/locale/fr'

const getTypeOrganisme = () => faker.helpers.arrayElement(['FDD', 'FE', 'ARUP', 'FRUP'])
const getChampsDescriptor = () => ({
  id: faker.string.nanoid(29),
  type: 'text',
  label: faker.lorem.sentence(),
  options: null,
  required: false,
  description: faker.lorem.sentence(),
  champDescriptors: null,
})
const getRevision = () => ({
  id: faker.string.nanoid(29),
  champDescriptors: Array.from({ length: faker.number.int({ min: 0, max: 20 }) }, getChampsDescriptor),
  annotationDescriptors: Array.from({ length: faker.number.int({ min: 0, max: 20 }) }, getChampsDescriptor),
})
const getRevisions = () => Array.from({ length: faker.number.int({ min: 1, max: 20 }) }, getRevision)

export const generateDemarche = () => ({
  id: faker.number.int(),
  state: 'publiee',
  title: faker.lorem.sentence(5),
  typeOrganisme: getTypeOrganisme(),
  lastSynchronisedAt: faker.date.past().toISOString(),
  dsDataJson: {
    id: faker.string.nanoid(29),
    state: 'publiee',
    title: faker.lorem.sentence(5),
    number: faker.number.int(),
    declarative: 'accepte',
    description: faker.lorem.sentence(5),
    dateCreation: faker.date.past().toISOString(),
    dateFermeture: faker.date.past().toISOString(),
    datePublication: faker.date.past().toISOString(),
    dateDepublication: faker.date.past().toISOString(),
    dateDerniereModification: faker.date.past().toISOString(),
    service: {
      id: faker.string.nanoid(29),
      nom: 'DLPAJ',
      siret: faker.string.numeric(14),
      organisme: 'Direction des libertés publiques et des affaires juridiques',
      typeOrganisme: 'administration_centrale',
    },
    revisions: getRevisions(),
    draftRevision: getRevisions(),
    publishedRevision: () => {
      const revision = getRevision()
      revision.annotationDescriptors.push({
        id: faker.string.nanoid(29),
        type: 'text',
        label: 'Type d\'organisme',
        options: null,
        required: false,
        description: getTypeOrganisme(),
        champDescriptors: null,
      })
      return revision
    },
    groupeInstructeurs: Array.from({ length: faker.number.int({ min: 1, max: 20 }) }, () => ({
      id: faker.string.nanoid(29),
      label: faker.lorem.words(5),
      number: faker.number.int(),
      instructeurs: Array.from({ length: faker.number.int({ min: 1, max: 20 }) }, () => ({
        id: faker.string.nanoid(29),
        email: faker.internet.email(),
      })),
    })),
  },
})

export const generateDemarches = () => Array.from({ length: faker.number.int({ min: 1, max: 20 }) }, () => generateDemarche())
