import * as dayjs from 'dayjs'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const dossiersWithDates = () => {
  const now = dayjs()
  const dateReceipt2 = now.subtract(2, 'days').startOf('day')
  const dateReceipt1 = dateReceipt2.subtract(5, 'days')
  const dateInstruction = dateReceipt2.add(2, 'days')

  return {
    id: 'RG9zc2llci0xMzY=',
    number: 143,
    archived: false,
    state: 'en_instruction',
    dateDerniereModification: '2020-07-26T04:26:48.000Z',
    datePassageEnInstruction: dateInstruction.toISOString(),
    datePassageEnConstruction: '2020-09-05T16:53:38+02:00',
    messages: [],
    champs: [
      {
        id: 'useless',
        __typename: 'TextChamp',
        label: "Saisir le n°RNA de l'association",
        stringValue: 'W123456789',
        champDescriptor: {
          id: 'Q2hhbXAtMTA0NQ==',
        },
      },
    ],
    annotations: [
      {
        id: 'Q2hhbXAtMTEwOQ==',
        date: dateReceipt1.format('YYYY-MM-DD'),
        label: 'Date de la première demande de pièces',
        __typename: 'DateChamp',
        stringValue: dateReceipt1.format('DD MMMM YYYY'),
      },
      {
        id: 'Q2hhbXAtMTExMA==',
        date: dateReceipt2.format('YYYY-MM-DD'),
        label: 'Date de réception des pièces de la première demande',
        __typename: 'DateChamp',
        stringValue: dateReceipt2.format('DD MMMM YYYY'),
      },
      {
        id: 'Q2hhbXAtMTExMQ==',
        date: null,
        label: 'Date de début de prorogation',
        __typename: 'DateChamp',
        stringValue: '',
      },
      {
        id: 'Q2hhbXAtMTExMg==',
        label: 'Durée de la prorogation',
        __typename: 'IntegerNumberChamp',
        stringValue: '',
        integerNumber: null,
      },
      {
        id: 'Q2hhbXAtMTExMw==',
        date: null,
        label: 'Date de deuxième demande de pièces complémentaires',
        __typename: 'DateChamp',
        stringValue: '',
      },
      {
        id: 'Q2hhbXAtMTExNA==',
        date: null,
        label: 'Date de réception des pièces de la deuxième demande',
        __typename: 'DateChamp',
        stringValue: '',
      },
      {
        id: 'Q2hhbXAtMTExOA==',
        label: "Date de l'intention d'opposition aux financements",
        __typename: 'DateChamp',
        stringValue: '',
      },
    ],
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const smallDemarcheAndDossierFinancementEtrangerDataMock = () => ({
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
        {
          __typename: 'PieceJustificativeChampDescriptor',
          id: 'Q2hhbXAtNTg=',
          label: 'Chargement du fichier complété à partir du modèle',
          description: 'Merci de veiller à compléter le modèle sans en modifier la structure (ne pas ajouter de colonne, ne pas faire de mise en forme, etc.)',
          required: false,
          fileTemplate: {
            filename: 'modele-financements-inferieurs-15300.xlsx',
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            checksum: 'TYfaas3CfEWOgE+EE1D3Ig==',
            byteSize: '9810',
            url: 'https://demarches-simplifiees.fr/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkblJvZGpreE0zaGhlR2sxYVhoNGIzRnpkR1J3Y2pGemVYbHFNZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVh4aGRIUmhZMmh0Wlc1ME95Qm1hV3hsYm1GdFpUMGliVzlrWld4bExXWnBibUZ1WTJWdFpXNTBjeTFwYm1abGNtbGxkWEp6TFRFMU16QXdMbmhzYzNnaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkoyMXZaR1ZzWlMxbWFXNWhibU5sYldWdWRITXRhVzVtWlhKcFpYVnljeTB4TlRNd01DNTRiSE40QmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NKR1lYQndiR2xqWVhScGIyNHZkbTVrTG05d1pXNTRiV3htYjNKdFlYUnpMVzltWm1salpXUnZZM1Z0Wlc1MExuTndjbVZoWkhOb1pXVjBiV3d1YzJobFpYUUdPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6IjIwMjMtMDktMThUMjE6MjA6NDIuNjUwWiIsInB1ciI6ImJsb2Jfa2V5In19--bfdc091df3ebd99e08e231fed38683924a5e5163/modele-financements-inferieurs-15300.xlsx',
          },
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
        {
          __typename: 'DateChampDescriptor',
          id: 'Q2hhbXAtMTEwOQ==',
          type: 'date',
          label: 'Date de la première demande de pièces',
          options: null,
          required: false,
          description: 'Date qui interrompt le compteur du délai de 2 mois',
          champDescriptors: null,
        },
        {
          __typename: 'DateChampDescriptor',
          id: 'Q2hhbXAtMTExMA==',
          type: 'date',
          label: 'Date de réception des pièces de la première demande',
          options: null,
          required: false,
          description: 'Date à partir de laquelle on fait repartir un délai de 2 mois',
          champDescriptors: null,
        },
        {
          __typename: 'DateChampDescriptor',
          id: 'Q2hhbXAtMTExMQ==',
          type: 'date',
          label: 'Date de début de prorogation',
          options: null,
          required: false,
          description: '',
          champDescriptors: null,
        },
        {
          __typename: 'IntegerNumberChampDescriptor',
          id: 'Q2hhbXAtMTExMg==',
          type: 'integer_number',
          label: 'Durée de la prorogation',
          options: null,
          required: false,
          description: 'Par défaut, on met 120',
          champDescriptors: null,
        },
        {
          __typename: 'DateChampDescriptor',
          id: 'Q2hhbXAtMTExMw==',
          type: 'date',
          label: 'Date de deuxième demande de pièces complémentaires',
          options: null,
          required: false,
          description: "Cette date suspend le délai d'instruction.",
          champDescriptors: null,
        },
        {
          __typename: 'DateChampDescriptor',
          id: 'Q2hhbXAtMTExNA==',
          type: 'date',
          label: 'Date de réception des pièces de la deuxième demande',
          options: null,
          required: false,
          description: "Cette date relance le décompte du délai restant d'instruction.",
          champDescriptors: null,
        },
        {
          __typename: 'DateChampDescriptor',
          id: 'Q2hhbXAtMTExOA==',
          type: 'date',
          label: "Date de l'intention d'opposition aux financements",
          options: null,
          required: false,
          description: "Interrompt de délai restant, et lance un compteur de 30 jours pendant lequel l'usager doit répondre.",
          champDescriptors: null,
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
            {
              id: 'Q2hhbXAtNTg=',
              __typename: 'PieceJustificativeChamp',
              label: 'Chargement du fichier complété à partir du modèle',
              stringValue: '',
              file: {
                filename: 'modele-financements-inferieurs-15300.xlsx',
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                checksum: 'D4io8724vjNaW4AXltzPCQ==',
                byteSizeBigInt: '9403',
                url: 'https://api.example.com/modele-financements-inferieurs-15300.xlsx',
              },
              champDescriptor: {
                id: 'Q2hhbXAtNTg=',
              },
            },
          ],
          annotations: [
            {
              id: 'Q2hhbXAtODc=',
              __typename: 'TextChamp',
              label: 'Une annotation',
              stringValue: "Oui oui c'est fait, merci bien.",
            },
            {
              id: 'Q2hhbXAtMTEwOQ==',
              date: null,
              label: 'Date de la première demande de pièces',
              __typename: 'DateChamp',
              stringValue: '',
            },
            {
              id: 'Q2hhbXAtMTExMA==',
              date: null,
              label: 'Date de réception des pièces de la première demande',
              __typename: 'DateChamp',
              stringValue: '',
            },
            {
              id: 'Q2hhbXAtMTExMQ==',
              date: null,
              label: 'Date de début de prorogation',
              __typename: 'DateChamp',
              stringValue: '',
            },
            {
              id: 'Q2hhbXAtMTExMg==',
              label: 'Durée de la prorogation',
              __typename: 'IntegerNumberChamp',
              stringValue: '',
              integerNumber: null,
            },
            {
              id: 'Q2hhbXAtMTExMw==',
              date: null,
              label: 'Date de deuxième demande de pièces complémentaires',
              __typename: 'DateChamp',
              stringValue: '',
            },
            {
              id: 'Q2hhbXAtMTExNA==',
              date: null,
              label: 'Date de réception des pièces de la deuxième demande',
              __typename: 'DateChamp',
              stringValue: '',
            },
            {
              id: 'Q2hhbXAtMTExOA==',
              label: "Date de l'intention d'opposition aux financements",
              __typename: 'DateChamp',
              stringValue: '',
            },
          ],
        },
        dossiersWithDates(),
        {
          id: 'RG9zc2llci0xNDQ=',
          number: 144,
          archived: false,
          state: 'en_instruction',
          dateDerniereModification: '2020-07-26T04:26:48.000Z',
          messages: [],
          champs: [],
          annotations: [],
          demandeur: {
            __typename: 'PersonnePhysique',
            civilite: 'M',
            nom: 'Michel',
            prenom: 'MARTIN',
          },
        },
      ],
    },
  },
})
