export const demarcheWithPrefectureMock = {
  demarche: {
    id: 'UHJvY2VkdXJlLTM5',
    number: 102,
    title: 'Fake demarche',
    state: 'publiee',
    declarative: null,
    dateCreation: '2023-10-02T09:28:22+02:00',
    dateFermeture: null,
    activeRevision: {
      id: 'UHJvY2VkdXJlUmV2aXNpb24tMTEx',
      datePublication: '2023-10-02T10:38:39+02:00',
      champDescriptors: [],
      annotationDescriptors: [],
    },
    dossiers: {
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        endCursor: 'Mg',
      },
      nodes: [
        {
          id: 'RG9zc2llci0xNDI1',
          number: 202,
          state: 'en_construction',
          groupeInstructeur: {
            label: '57 - Some random string',
          },
          champs: [],
          annotations: [],
          messages: [],
        },
        {
          id: 'RG9zc2llci0xNDI2',
          number: 203,
          state: 'en_construction',
          groupeInstructeur: {
            label: '1234 - Some random string',
          },
          champs: [],
          annotations: [],
          messages: [],
        },
      ],
    },
  },
}
