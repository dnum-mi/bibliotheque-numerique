import { createStepButton } from '@/composables/use-tour'
import type { UseStepOptions } from '@/composables/use-tour'

export const filterTourSteps: UseStepOptions[] = [
  {
    id: 'step-welcome',
    title: 'Tutoriel sur les vues',
    text: '<p>Découvrez comment combiner des filtres, tri et selection de colonne pour personnaliser votre vue.</p>',
    buttons: [
      createStepButton({
        text: 'Commencer',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-presentation-filtre-affichage',
    title: 'Charger une vue personnalisée',
    text: '<p>Utilisez cette section pour charger l’une de vos vues enregristrées. Les critères associés seront automatiquement appliqués au tableau.</p>',
    attachTo: { element: '#custom-filter-select', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Suivant',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-button-create-duplicate',
    title: 'Créer ou dupliquer une vue',
    text: `
      <p>Ce bouton vous permet de créer une nouvelle vue si aucune n’est sélectionnée. Il permet aussi de dupliquer une vue existante sinon.</p>
    `,
    attachTo: { element: '#create-duplicate-filter-button', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Suivant',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-button-save',
    title: 'Enregistrer un vue modifiée',
    text: '<p>Après avoir ajouté ou supprimé des critères, cliquez ici pour sauvegarder les modifications sur la vue sélectionnée.</p>',
    attachTo: { element: '#update-filter-button', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Suivant',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-button-rename',
    title: 'Renommer',
    text: '<p>Ce bouton vous permet de renommer votre vue. Il permet aussi d\'ajuster les totaux numéraires pour les statistiques</p>',
    attachTo: { element: '#rename-filter-button', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Suivant',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-button-delete',
    title: 'Supprimer une vue',
    text: '<p>Ce bouton vous permet de supprimer une vue personnalisée.</p>',
    attachTo: { element: '#delete-filter-button', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Suivant',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-display-filters',
    title: 'Visualiser les filtres actifs',
    text: '<p>Les filtres actuellement actifs s’affichent ici. Vous pouvez désactiver temporairement un critère en cliquant sur la croix (X).</p>',
    attachTo: { element: '#active-filters-dropdown-trigger', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Compris !',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-warning',
    title: 'Attention aux modifications temporaires',
    text: '<p>Ajouter ou retirer un filtre met automatiquement à jour le tableau. Cependant, cela ne modifie pas votre vue sélectionnée. Si vous souhaitez garder ces filtres pour la vue en cours, il faut cliquer sur le bouton sauvegarder.</p>',
    attachTo: { element: '#active-filters-dropdown-trigger', on: 'bottom' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({
        text: 'Compris !',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-save',
    title: 'Sauvegarder les modifications',
    text: '<p>Pour que vos modifications soient prises en compte de façon permanente, il faut cliquer sur "Enregistrer" lorsqu\'une vue est sélectionnée. Sinon, commencez par créer une nouvelle via le bouton dédié.</p>',
    attachTo: { element: '#update-filter-button', on: 'top' },
    buttons: [
      createStepButton({
        text: 'Précédent',
        action: 'back',
        secondary: true,
      }),
      createStepButton({ text: 'Terminer', action: 'complete' }),
    ],
  },
]
