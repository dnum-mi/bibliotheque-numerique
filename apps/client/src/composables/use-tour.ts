import type { TourOptions, StepOptions, Tour as ShepherdTour } from 'shepherd.js'
import Shepherd from 'shepherd.js'
import type { Ref } from 'vue'

const ALLOWED_TOUR_ACTIONS = ['next', 'back', 'complete', 'cancel'] as const
type TourAction = (typeof ALLOWED_TOUR_ACTIONS)[number]

export interface StepButton {
  text: string
  action: TourAction
  secondary?: boolean
  classes?: string
}

export interface UseStepOptions extends StepOptions {}

export interface UseTourOptions {
  tourId: string
  steps: StepOptions[]
  shepherdOptions?: TourOptions
}

export interface UseTourReturn {
  startTour: () => void
  resetTour: () => void
  isTourActive: Readonly<Ref<boolean>>
  isTourCompleted: Readonly<Ref<boolean>>
  tourInstance: Ref<ShepherdTour | null>
}

function safeLocalStorage (key: string, value?: string): string | null {
  try {
    if (value !== undefined) {
      localStorage.setItem(key, value)
      return value
    }
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function createStepButton (customButton: StepButton) {
  return {
    text: customButton.text,
    classes: customButton.secondary ? 'shepherd-button fr-btn--tertiary' : 'shepherd-button',
    action () {
      if (ALLOWED_TOUR_ACTIONS.includes(customButton.action)) {
        return (this as any)[customButton.action]()
      } else {
        console.warn(`Action non autorisée: ${customButton.action}`)
      }
    },
  }
}

export function useTour (options: UseTourOptions): UseTourReturn {
  if (!options.tourId || !options.steps?.length) {
    throw new Error('useTour: tourId et steps sont requis')
  }

  const { tourId, steps, shepherdOptions } = options

  const tourInstance = ref<ShepherdTour | null>(null)
  const isTourActive = ref(false)
  const isTourCompleted = ref(safeLocalStorage(`tour-completed-${tourId}`) === 'true')

  const onTourEnd = () => {
    isTourActive.value = false
    isTourCompleted.value = true
    localStorage.setItem(`tour-completed-${tourId}`, 'true')
  }

  const initTour = () => {
    if (tourInstance.value) {
      return
    }
    try {
      const defaultTourOptions: TourOptions = {
        useModalOverlay: true,
        defaultStepOptions: {
          buttons: [
            {
              action () {
                return this.back()
              },
              classes: 'shepherd-button fr-btn--tertiary',
              text: 'Précédent',
            },
            {
              action () {
                return this.next()
              },
              classes: 'shepherd-button',
              text: 'Suivant',
            },
          ],
          classes: 'shepherd-custom-class',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: {
            enabled: true,
            label: 'Fermer le tutoriel',
          },
        },
      }

      const finalOptions = {
        ...defaultTourOptions,
        ...shepherdOptions,
      }

      const tour = new Shepherd.Tour(finalOptions)

      const validSteps = steps.filter((step) => {
        if (!step.title && !step.text) {
          console.warn('Step ignoré: titre et texte manquants', step)
          return false
        }
        return true
      })

      if (validSteps.length === 0) {
        throw new Error('Aucun step valide trouvé')
      }

      tour.addSteps(steps)

      tour.on('show', () => {
        isTourActive.value = true
      })
      tour.on('complete', () => {
        onTourEnd()
      })
      tour.on('cancel', () => {
        onTourEnd()
      })
      tourInstance.value = tour
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du tour: ', error)
      throw error
    }
  }

  const startTour = () => {
    try {
      if (!tourInstance.value) {
        initTour()
      }

      nextTick()
      tourInstance.value?.start()
    } catch (error) {
      console.error(`Erreur lors du démarrage du tour: `, error)
    }
  }

  const resetTour = () => {
    try {
      safeLocalStorage(`tour-completed-${tourId}`)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`tour-completed-${tourId}`)
      }
      isTourCompleted.value = false
    } catch (error) {
      console.warn(`Erreur lors de la réinitialisation du tour: `, error)
    }
  }

  onUnmounted(() => {
    try {
      if (tourInstance.value) {
        tourInstance.value.off('show')
        tourInstance.value.off('complete')
        tourInstance.value.off('cancel')

        if (tourInstance.value.isActive()) {
          tourInstance.value.cancel()
        }

        tourInstance.value = null
      }
    } catch (error) {
      console.warn(`Erreur lors du nettoyage du tour: `, error)
    }
  })

  return {
    startTour,
    resetTour,
    isTourActive: readonly(isTourActive),
    isTourCompleted: readonly(isTourCompleted),
    tourInstance,
  }
}
