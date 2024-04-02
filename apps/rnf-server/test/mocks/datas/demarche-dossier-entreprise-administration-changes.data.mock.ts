export const demarcheDossierEntrepriseAdministrationChangesRnfId = '042-FE-000002-00'
export const demarcheDossierEntrepriseAdministrationChangesNewTitle = 'Un super titre'

export const demarcheDossierEntrepriseAdministrationChangesDataMock = {
  demarche: {
    number: 55,
    dossiers: {
      nodes: [
        {
          number: 1,
          state: 'pas bon etat',
          champs: [],
        },
        {
          id: 'RG9zc2llci0xMTg=',
          number: 2,
          state: 'accepte',
          champs: [
            {
              id: 'Q2hhbXAtMTIyNg==',
              __typename: 'TextChamp',
              label: 'Renseigner votre identifiant RNF pour vérification',
              stringValue: '059-FE-00001-04',
              champDescriptor: {
                id: 'Q2hhbXAtMTIyNg==',
                type: 'text',
                label: 'Renseigner votre identifiant RNF pour vérification',
                description: '<!-- #rnf-numero-rnf-rnf# -->',
                required: true,
                __typename: 'TextChampDescriptor',
                champDescriptors: null,
              },
            },
            {
              id: 'Q2hhbXAtMTIxOA==',
              __typename: 'TextChamp',
              label: "Nouveau titre de la fondation d'entreprise",
              stringValue: 'Nouveau titre',
              champDescriptor: {
                id: 'Q2hhbXAtMTIxOA==',
                type: 'text',
                label: "Nouveau titre de la fondation d'entreprise",
                description:
                  'Indiquer le nouveau titre souhaité.\r\n<!-- #rnf-titre-rnf# -->',
                required: true,
                __typename: 'TextChampDescriptor',
                champDescriptors: null,
              },
            },
          ],
        },
        {
          id: 'RG9zc2llci0xMTg=',
          number: 3,
          state: 'accepte',
          champs: [
            {
              id: 'Q2hhbXAtMTE5OA==',
              __typename: 'TextChamp',
              label: 'Identifiant RNF',
              stringValue: demarcheDossierEntrepriseAdministrationChangesRnfId,
              champDescriptor: {
                id: 'Q2hhbXAtMTE5OA==',
                type: 'explication',
                label: 'Identifiant RNF',
                description:
                  "Ce numéro unique permet d'identifier votre structure tout au long de sa vie administrative. Si votre structure ne dispose pas encore d'un identifiant, veuillez engager la démarche \"demande d'identifiant RNF\".",
                required: false,
                __typename: 'ExplicationChampDescriptor',
                champDescriptors: null,
              },
            },
            {
              id: 'Q2hhbXAtMTIyNg==',
              __typename: 'TextChamp',
              label: 'Renseigner votre identifiant RNF pour vérification',
              stringValue: demarcheDossierEntrepriseAdministrationChangesRnfId,
              champDescriptor: {
                id: 'Q2hhbXAtMTIyNg==',
                type: 'text',
                label: 'Renseigner votre identifiant RNF pour vérification',
                description: '<!-- #rnf-numero-rnf-rnf# -->',
                required: true,
                __typename: 'TextChampDescriptor',
                champDescriptors: null,
              },
            },
            {
              id: 'Q2hhbXAtMTIxOA==',
              __typename: 'TextChamp',
              label: "Nouveau titre de la fondation d'entreprise",
              stringValue: demarcheDossierEntrepriseAdministrationChangesNewTitle,
              champDescriptor: {
                id: 'Q2hhbXAtMTIxOA==',
                type: 'text',
                label: "Nouveau titre de la fondation d'entreprise",
                description:
                  'Indiquer le nouveau titre souhaité.\r\n<!-- #rnf-titre-rnf# -->',
                required: true,
                __typename: 'TextChampDescriptor',
                champDescriptors: null,
              },
            },
          ],
        },
      ],
    },
  },
}
