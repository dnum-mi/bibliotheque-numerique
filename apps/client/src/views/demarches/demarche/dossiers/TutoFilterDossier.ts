import type { BnStepOptions } from '@/composables/use-tour'

export const filterTourSteps: BnStepOptions[] = [
  {
    id: 'step-welcome',
    title: 'Tutoriel sur les filtres !',
    text: '<p>Suivez ce guide rapide pour découvrir les fonctionnalités de filtres combinés avec les filtres d\'affichage enregistrés.</p>',
    buttons: [
      {
        text: 'Commencer',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-presentation-filtre-affichage',
    title: 'Filtres personnalisés',
    text: '<p>Ici vous pouvez charger un de vos filtres personnalisés. Cela applique les critères au tableau.</p>',
    attachTo: { element: '#custom-filter-select', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Suivant',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-button-create-duplicate',
    title: 'Création ou duplication d\'un filtre personnalisé',
    text: `
      <p>Ce bouton vous permet de créer un filtre personnalisé si aucun affichage sélectionné ou dupliquer l\'affichage sélectionné.</p>
    `,
    attachTo: { element: '#create-duplicate-filter-button', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Suivant',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-button-save',
    title: 'Sauvegarde d\'un filtre personnalisé',
    text: '<p>Ce bouton vous permet de sauvegarder l\'affichage sélectionné si des filtres ont été ajoutés ou supprimés au tableau.</p>',
    attachTo: { element: '#update-filter-button', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Suivant',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-button-rename',
    title: 'Renommage d\'un filtre personnalisé !',
    text: '<p>Ce bouton vous permet de renommer l\'affichage ou changer la colonne du total numéraire.</p>',
    attachTo: { element: '#rename-filter-button', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Suivant',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-button-delete',
    title: 'Suppression d\'un filtre personnalisé !',
    text: '<p>Ce bouton vous permet de supprimer l\'affichage personnalisé.</p>',
    attachTo: { element: '#delete-filter-button', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Suivant',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-display-filters',
    title: 'Filtres appliqués au tableau',
    text: '<p>Ici, vous voyez les filtres actifs. Vous pouvez en supprimer un temporairement en cliquant sur la croix (×).</p>',
    attachTo: { element: '#active-filters-dropdown-trigger', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Compris !',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-warning',
    title: '⚠️ Important',
    text: '<p>Lorsque vous ajoutez ou supprimez un filtre, le tableau se met à jour, mais votre filtre personnalisé <strong>n\'est PAS encore modifié</strong>. Le changement est temporaire.</p>',
    attachTo: { element: '#active-filters-dropdown-trigger', on: 'bottom' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      {
        text: 'Compris !',
        action: 'next',
      },
    ],
  },
  {
    id: 'step-save',
    title: 'Action requise pour sauvegarder',
    text: '<p>Pour rendre vos modifications permanentes, vous <strong>DEVEZ</strong> cliquer sur ce bouton \'Enregistrer\' si vous avez déjà sélectionné un filtre personnalisé sinon vous devez en créer un d\'abord.</p>',
    attachTo: { element: '#update-filter-button', on: 'top' },
    buttons: [
      {
        text: 'Précédent',
        action: 'back',
        secondary: true,
      },
      { text: 'Terminer', action: 'complete' },
    ],
  },
]
