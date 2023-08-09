export const smallDemarcheAndDossierFinancementEtrangerDataMock = {
  demarche: {
    id: 'UHJvY2VkdXJlLTI5',
    number: 43,
    title: 'Small Déclaration des financements étrangers',
    state: 'publiee',
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
              id: 'useless',
              __typename: 'TextChamp',
              label: 'Préciser si SR déjà saisis',
              stringValue: "Oui oui c'est fait, merci bien.",
            },
          ],
        },
      ],
    },
  },
}
