import { createStepButton } from '@/composables/use-tour'
import type { UseStepOptions } from '@/composables/use-tour'

export const filterTourSteps: UseStepOptions[] = [
  {
    id: 'step-welcome',
    title: 'Comprendre les vues',
    text: `
      <p>
        Une <strong>vue</strong> mémorise votre configuration du tableau :
        <strong>colonnes</strong> (ordre, taille, sélection), <strong>tri</strong>, <strong>filtres</strong>,
        et mode champ / mode dossier.
      </p>
      <p>
        Vous pouvez modifier le tableau librement, puis <strong>sauvegarder</strong> ces changements dans une vue.
      </p>
    `,
    buttons: [
      createStepButton({ text: 'Commencer', action: 'next' }),
    ],
  },

  {
    id: 'step-pick-view',
    title: 'Sélectionner une vue',
    text: `
      <p>
        Ici, vous choisissez une vue enregistrée. Le tableau se met à jour automatiquement
        avec les colonnes, filtres et tri de cette vue.
      </p>
      <p>
        Astuce : si vous re-cliquez sur la vue déjà sélectionnée, ça recharge la dernière version sauvegardée de la vue.
      </p>
    `,
    attachTo: { element: '#custom-view-select', on: 'bottom' },
    buttons: [
      createStepButton({ text: 'Précédent', action: 'back', secondary: true }),
      createStepButton({ text: 'Suivant', action: 'next' }),
    ],
  },

  {
    id: 'step-edit-view',
    title: 'Modifier une vue (stylo)',
    text: `
      <p>
        Dans la liste, le <strong>stylo</strong> permet d’ouvrir la fenêtre d’édition d’une vue
        (renommer, totaux, supprimer).
      </p>
      <p>
        Important : vous pouvez éditer une autre vue <em>sans changer</em> la vue actuellement appliquée au tableau.
      </p>
    `,
    attachTo: { element: '#custom-view-select', on: 'bottom' },
    buttons: [
      createStepButton({ text: 'Précédent', action: 'back', secondary: true }),
      createStepButton({ text: 'Suivant', action: 'next' }),
    ],
  },

  {
    id: 'step-main-action',
    title: 'Créer ou sauvegarder',
    text: `
      <p>
        Ce bouton change de rôle selon le contexte :
      </p>
      <ul>
        <li><strong>Créer une vue</strong> si aucune vue n’est sélectionnée.</li>
        <li><strong>Sauvegarder</strong> si une vue est sélectionnée et que vous avez modifié le tableau.</li>
      </ul>
    `,
    attachTo: { element: '#main-view-action', on: 'bottom' },
    buttons: [
      createStepButton({ text: 'Précédent', action: 'back', secondary: true }),
      createStepButton({ text: 'Suivant', action: 'next' }),
    ],
  },

  {
    id: 'step-create-from',
    title: 'Créer à partir du tableau ou d’une vue',
    text: `
      <p>
        Quand vous créez une vue, vous choisissez le <strong>point de départ</strong> :
      </p>
      <ul>
        <li><strong>Tableau actuel</strong> : vous figez l’état visible maintenant.</li>
        <li><strong>Vue existante</strong> : vous partez d’une vue déjà enregistrée, puis vous ajustez.</li>
      </ul>
    `,
    attachTo: { element: '#main-view-action', on: 'top' },
    buttons: [
      createStepButton({ text: 'Précédent', action: 'back', secondary: true }),
      createStepButton({ text: 'Suivant', action: 'next' }),
    ],
  },

  {
    id: 'step-totals',
    title: 'Totaux numéraires',
    text: `
      <p>
        Vous pouvez définir jusqu’à <strong>deux totaux</strong> sur des colonnes numériques.
        Ces totaux se retrouveront dans l'onglet statistique.
      </p>
    `,
    attachTo: { element: '#view-modal-totals', on: 'top' },
    buttons: [
      createStepButton({ text: 'Précédent', action: 'back', secondary: true }),
      createStepButton({ text: 'Suivant', action: 'next' }),
    ],
  },

  {
    id: 'step-active-filters',
    title: 'Filtres actifs : temporaire vs sauvegardé',
    text: `
      <p>
        Ici vous voyez les <strong>filtres actifs</strong>. Vous pouvez retirer un filtre rapidement.
      </p>
      <p>
        Attention : modifier les filtres met à jour le tableau, mais <strong>ne modifie pas</strong> la vue
        tant que vous n’avez pas cliqué sur <strong>Sauvegarder</strong>.
      </p>
    `,
    attachTo: { element: '#active-filters-dropdown-trigger', on: 'bottom' },
    buttons: [
      createStepButton({ text: 'Précédent', action: 'back', secondary: true }),
      createStepButton({ text: 'Terminer', action: 'complete' }),
    ],
  },
]
