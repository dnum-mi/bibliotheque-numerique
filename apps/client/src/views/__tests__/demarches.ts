import { faker } from '@faker-js/faker/locale/fr'

const getTypeOrganisme = () => { return faker.helpers.arrayElement(['FDD', 'FE', 'ARUP', 'FRUP']) }
const getChampsDescriptor = () => ({
  id: faker.datatype.string(29),
  type: 'text',
  label: faker.lorem.sentence(),
  options: null,
  required: false,
  description: faker.lorem.sentence(),
  champDescriptors: null,
})
const getRevision = () => ({
  id: faker.datatype.string(29),
  champDescriptors: Array.from({ length: faker.datatype.number({ min: 0, max: 20 }) }, getChampsDescriptor),
  annotationDescriptors: Array.from({ length: faker.datatype.number({ min: 0, max: 20 }) }, getChampsDescriptor),
})
const getRevisions = () => Array.from({ length: faker.datatype.number({ min: 1, max: 20 }) }, getRevision)

export const generateDemarche = () => ({
  id: faker.datatype.number(),
  state: 'publiee',
  title: faker.lorem.sentence(5),
  typeOrganisme: getTypeOrganisme(),
  demarcheDS: {
    dataJson: {
      id: faker.datatype.string(29),
      state: 'publiee',
      title: faker.lorem.sentence(5),
      number: faker.datatype.number(),
      declarative: 'accepte',
      description: faker.lorem.sentence(5),
      dateCreation: faker.date.past().toISOString(),
      dateFermeture: faker.date.past().toISOString(),
      datePublication: faker.date.past().toISOString(),
      dateDepublication: faker.date.past().toISOString(),
      dateDerniereModification: faker.date.past().toISOString(),
      service: {
        id: faker.datatype.string(29),
        nom: 'DLPAJ',
        siret: faker.random.numeric(14),
        organisme: 'Direction des libertés publiques et des affaires juridiques',
        typeOrganisme: 'administration_centrale',
      },
      revisions: getRevisions(),
      draftRevision: getRevisions(),
      publishedRevision: () => {
        const revision = getRevision()
        revision.annotationDescriptors.push({
          id: faker.datatype.string(29),
          type: 'text',
          label: "Type d'organisme",
          options: null,
          required: false,
          description: getTypeOrganisme(),
          champDescriptors: null,
        })
        return revision
      },
      groupeInstructeurs: Array.from({ length: faker.datatype.number({ min: 1, max: 20 }) }, () => ({
        id: faker.datatype.string(29),
        label: faker.random.words(5),
        number: faker.datatype.number(),
        instructeurs: Array.from({ length: faker.datatype.number({ min: 1, max: 20 }) }, () => ({
          id: faker.datatype.string(29),
          email: faker.internet.email(),
        })),
      })),
    },
    dsUpdateAt: faker.date.past().toISOString(),
    createAt: faker.date.past().toISOString(),
    updateAt: faker.date.past().toISOString(),
  },
})

export const generateDemarches = () => Array.from({ length: faker.datatype.number({ min: 1, max: 20 }) }, () => generateDemarche())
