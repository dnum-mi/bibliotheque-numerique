export const smallDemarcheAndDossierFinancementEtrangerDataMock = {
  demarche: {
    id: 'UHJvY2VkdXJlLTI5',
    number: 42,
    title: 'Small Déclaration des financements étrangers',
    state: 'publiee',
    activeRevision: {
      id: 'UHJvY2VkdXJlUmV2aXNpb24tNTY=',
      datePublication: '2023-07-27T16:33:59+02:00',
      champDescriptors: [
        {
          __typename: 'HeaderSectionChampDescriptor',
          id: 'Q2hhbXAtMTA0Mw==',
          label: 'Informations relatives au bénéficiaire du financement',
          description: '',
          required: false,
        },
        {
          __typename: 'RNAChampDescriptor',
          id: 'Q2hhbXAtMTA0NQ==',
          label: "Saisir le n°RNA de l'association",
          description:
            'Le numéro RNA se compose de la lettre « W » suivi du code de votre département (ou pour les outremers du chiffre 9 + une lettre) suivi de 7 chiffres.',
          required: false,
        },
        {
          __typename: 'RepetitionChampDescriptor',
          id: 'Q2hhbXAtMTA2NQ==',
          label: 'Liste de course',
          description: '',
          required: false,
          champDescriptors: [
            {
              __typename: 'TextChampDescriptor',
              id: 'Q2hhbXAtMTA2Nnww',
              label: 'Fruit',
              description: '',
              required: false,
            },
            {
              __typename: 'TextChampDescriptor',
              id: 'Q2hhbXAtMTA2N3ww',
              label: 'Légume',
              description: '',
              required: false,
            },
          ],
        },
      ],
      annotationDescriptors: [
        {
          __typename: 'TextChampDescriptor',
          id: 'Q2hhbXAtODc=',
          label: 'Une annotation',
          description: '',
          required: false,
        },
      ],
    },
    dossiers: {
      nodes: [
        {
          id: 'RG9zc2llci0xMzY=',
          number: 142,
          archived: false,
          state: 'en_construction',
          dateDerniereModification: '2020-07-26T04:26:48.000Z',
          messages: [],
          champs: [
            {
              id: 'useless',
              __typename: 'TextChamp',
              label: 'Informations relatives au bénéficiaire du financement',
              stringValue: "C'est du chocolat.",
              champDescriptor: {
                id: 'Q2hhbXAtMTA0Mw==',
              },
            },
            {
              id: 'useless',
              __typename: 'TextChamp',
              label: "Saisir le n°RNA de l'association",
              stringValue: 'W123456789',
              champDescriptor: {
                id: 'Q2hhbXAtMTA0NQ==',
              },
            },
            {
              id: 'useless',
              __typename: 'RepetitionChamp',
              label: 'Liste de course',
              stringValue: '',
              champDescriptor: {
                id: 'Q2hhbXAtMTA2NQ==',
              },
              rows: [
                {
                  champs: [
                    {
                      id: 'useless',
                      __typename: 'TextChamp',
                      label: 'Fruit',
                      stringValue: 'Fraise',
                      champDescriptor: {
                        id: 'Q2hhbXAtMTA2Nnww',
                      },
                    },
                    {
                      id: 'useless',
                      __typename: 'TextChamp',
                      label: 'Légume',
                      stringValue: 'Oignon',
                      champDescriptor: {
                        id: 'Q2hhbXAtMTA2N3ww',
                      },
                    },
                  ],
                },
                {
                  champs: [
                    {
                      id: 'useless',
                      __typename: 'TextChamp',
                      label: 'Fruit',
                      stringValue: 'Framboise',
                      champDescriptor: {
                        id: 'Q2hhbXAtMTA2Nnww',
                      },
                    },
                    {
                      id: 'useless',
                      __typename: 'TextChamp',
                      label: 'Légume',
                      stringValue: 'Poivron',
                      champDescriptor: {
                        id: 'Q2hhbXAtMTA2N3ww',
                      },
                    },
                  ],
                },
              ],
            },
          ],
          annotations: [
            {
              id: 'Q2hhbXAtODc=',
              __typename: 'TextChamp',
              label: 'Une annotation',
              stringValue: "Oui oui c'est fait, merci bien.",
            },
          ],
        },
      ],
    },
  },
}
