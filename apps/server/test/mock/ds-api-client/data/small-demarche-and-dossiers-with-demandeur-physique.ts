export const smallDemarcheAndDossierWithDemandeur = {
  demarche: {
    id: 'UHJvY2VkdXJlLTIwMA==',
    number: 200,
    title: 'Small Test demandeur',
    state: 'publiee',
    activeRevision: {
      id: 'UHJvY2VkdXJlUmV2aXNpb24tMjAw',
      datePublication: '2023-07-27T16:33:59+02:00',
    },
    dossiers: {
      nodes: [
        {
          id: 'RG9zc2llci0yMDA=',
          number: 200,
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
}
