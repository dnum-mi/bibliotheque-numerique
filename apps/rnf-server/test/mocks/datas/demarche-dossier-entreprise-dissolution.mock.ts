export const demarcheDossierEntrepriseDissolutionRnfId = '042-FE-000007-00'

export const demarcheDossierEntrepriseDissolutionDataMock = {
  demarche: {
    number: 54,
    dossiers: {
      nodes: [
        {
          id: 'RG9zc2llci0xMTg=',
          number: 31,
          state: 'accepte',
          champs: [
            {
              id: 'Q2hhbXAtMTE5OA==',
              __typename: 'TextChamp',
              label: 'Identifiant RNF',
              stringValue: demarcheDossierEntrepriseDissolutionRnfId,
              champDescriptor: {
                id: 'Q2hhbXAtMTE5OA==',
                type: 'explication',
                label: 'Identifiant RNF',
                description: '<!-- #rnf-numero-rnf-rnf# -->',
                required: false,
                __typename: 'ExplicationChampDescriptor',
                champDescriptors: null,
              },
            },
          ],
        },
      ],
    },
  },
}
