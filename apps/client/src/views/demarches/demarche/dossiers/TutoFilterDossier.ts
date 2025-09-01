import { createStepButton } from '@/composables/use-tour'
import type { UseStepOptions } from '@/composables/use-tour'

export const filterTourSteps: UseStepOptions[] = [
  {
    id: 'step-welcome',
    title: 'Tutoriel sur les filtres',
    text: '<p>Découvrez comment combiner des filtres temporaires avec des filtres enregistrés pour personnaliser votre affichage.</p>',
    buttons: [
      createStepButton({
        text: 'Commencer',
        action: 'next',
      }),
    ],
  },
  {
    id: 'step-presentation-filtre-affichage',
    title: 'Charger un filtre personnalisé',
    text: '<p>Utilisez cette section pour charger l’un de vos filtres enregistrés. Les critères associés seront automatiquement appliqués au tableau.</p>',
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
    title: 'Créer ou dupliquer un filtre',
    text: `
      <p>Ce bouton vous permet de créer un nouveau filtre personnalisé si aucun affichage n’est sélectionné ou de dupliquer un filtre existant pour le modifier sans altérer l’original.</p>
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
    title: 'Enregistrer un filtre modifié',
    text: '<p>Après avoir ajouté ou supprimé des critères, cliquez ici pour sauvegarder les modifications sur le filtre sélectionné.</p>',
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
    title: 'Renommer ou modifier les paramètres',
    text: '<p>Ce bouton vous permet de renommer votre filtre ou de modifier la colonne associée au total numéraire.</p>',
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
    title: 'Supprimer un filtre',
    text: '<p>Ce bouton vous permet de supprimer un filtre personnalisé.</p>',
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
    text: '<p>Ajouter ou retirer un filtre met automatiquement à jour le tableau. Cependant, cela ne modifie pas encore votre filtre enregistré : les changements sont temporaires.</p>',
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
    text: '<p>Pour que vos modifications soient prises en compte de façon permanente, il faut cliquer sur "Enregistrer" lorsqu\'un filtre est sélectionné. Sinon, commencez par créer un nouveau via le bouton dédié.</p>',
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
