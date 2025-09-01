export const demarcheWithRnfAndRnaDataMock = {
  demarche: {
    id: 'UHJvY2VkdXJlLTM4',
    number: 101,
    title: '[DEV] - Démarche pour Organismes',
    state: 'publiee',
    declarative: null,
    dateCreation: '2023-10-02T09:28:22+02:00',
    dateFermeture: null,
    activeRevision: {
      id: 'UHJvY2VkdXJlUmV2aXNpb24tMTEx',
      datePublication: '2023-10-02T10:38:39+02:00',
      champDescriptors: [
        {
          __typename: 'TextChampDescriptor',
          id: 'Q2hhbXAtMTIyNg==',
          label:
            'Renseigner un titre pour mettre quelque chose dans le dossier',
          description: '',
          required: true,
        },
        {
          __typename: 'RNAChampDescriptor',
          id: 'Q2hhbXAtMTM4Nw==',
          label: 'Mettez un IF RNA',
          description: '',
          required: false,
        },
        {
          __typename: 'TextChampDescriptor',
          id: 'Q2hhbXAtMTM4OA==',
          label: 'Mettez un ID RNF',
          description:
            'Ce champ devra être un RNAChampDescriptor une fois que la feature sera implémenté\r\n<!-- #bn-rnf-field-bn# -->',
          required: false,
        },
      ],
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
          number: 201,
          archived: false,
          state: 'en_construction',
          dateDerniereModification: '2023-10-02T10:38:43+02:00',
          dateDepot: '2023-10-02T09:29:52+02:00',
          datePassageEnConstruction: '2023-10-02T09:29:52+02:00',
          datePassageEnInstruction: null,
          dateTraitement: null,
          dateExpiration: '2024-10-02T09:29:52+02:00',
          dateSuppressionParUsager: null,
          motivation: null,
          motivationAttachment: null,
          attestation: null,
          champs: [
            {
              id: 'Q2hhbXAtMTIyNg==',
              __typename: 'TextChamp',
              label:
                'Renseigner un titre pour mettre quelque chose dans le dossier',
              stringValue: 'Titre inutile',
              champDescriptor: {
                __typename: 'TextChampDescriptor',
                id: 'Q2hhbXAtMTIyNg==',
                label:
                  'Renseigner un titre pour mettre quelque chose dans le dossier',
                description: '',
                required: true,
              },
            },
            {
              id: 'Q2hhbXAtMTM4Nw==',
              __typename: 'TextChamp',
              label: 'Mettez un IF RNA',
              stringValue: '',
              champDescriptor: {
                __typename: 'RNAChampDescriptor',
                id: 'Q2hhbXAtMTM4Nw==',
                label: 'Mettez un IF RNA',
                description: '',
                required: false,
              },
            },
            {
              id: 'Q2hhbXAtMTM4OA==',
              __typename: 'TextChamp',
              label: 'Mettez un ID RNF',
              stringValue: '033-FE-00001-02',
              champDescriptor: {
                __typename: 'TextChampDescriptor',
                id: 'Q2hhbXAtMTM4OA==',
                label: 'Mettez un ID RNF',
                description:
                  'Ce champ devra être un RNAChampDescriptor une fois que la feature sera implémenté\r\n<!-- #bn-rnf-field-bn# -->',
                required: false,
              },
            },
          ],
          annotations: [],
          messages: [],
        },
        {
          id: 'RG9zc2llci0xNDI2',
          number: 202,
          archived: false,
          state: 'en_construction',
          dateDerniereModification: '2023-10-02T10:38:43+02:00',
          dateDepot: '2023-10-02T09:29:52+02:00',
          datePassageEnConstruction: '2023-10-02T09:29:52+02:00',
          datePassageEnInstruction: null,
          dateTraitement: null,
          dateExpiration: '2024-10-02T09:29:52+02:00',
          dateSuppressionParUsager: null,
          motivation: null,
          motivationAttachment: null,
          attestation: null,
          champs: [
            {
              id: 'Q2hhbXAtMTIyNg==',
              __typename: 'TextChamp',
              label:
                'Renseigner un titre pour mettre quelque chose dans le dossier',
              stringValue: 'Titre inutile',
              champDescriptor: {
                __typename: 'TextChampDescriptor',
                id: 'Q2hhbXAtMTIyNg==',
                label:
                  'Renseigner un titre pour mettre quelque chose dans le dossier',
                description: '',
                required: true,
              },
            },
            {
              id: 'Q2hhbXAtMTM4Nw==',
              __typename: 'TextChamp',
              label: 'Mettez un ID RNA',
              stringValue: 'W271000008',
              champDescriptor: {
                __typename: 'RNAChampDescriptor',
                id: 'Q2hhbXAtMTM4Nw==',
                label: 'Mettez un IF RNA',
                description: '',
                required: false,
              },
            },
            {
              id: 'Q2hhbXAtMTM4OA==',
              __typename: 'TextChamp',
              label: 'Mettez un ID RNF',
              stringValue: '',
              champDescriptor: {
                __typename: 'TextChampDescriptor',
                id: 'Q2hhbXAtMTM4OA==',
                label: 'Mettez un ID RNF',
                description:
                  'Ce champ devra être un RNAChampDescriptor une fois que la feature sera implémenté\r\n<!-- #bn-rnf-field-bn# -->',
                required: false,
              },
            },
          ],
          annotations: [],
          messages: [],
        },
      ],
    },
  },
}
