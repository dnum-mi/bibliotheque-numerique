import type { TourOptions, StepOptions, Tour as ShepherdTour } from 'shepherd.js'
import Shepherd from 'shepherd.js'
import type { Ref, App } from 'vue'
import BnTourStep from '@/components/Tours/BnTourStep.vue'
import type { BnTourButton } from '@/components/Tours/BnTourStep.vue'

export interface BnStepOptions extends Omit<StepOptions, 'buttons' | 'text'> {
  title: string
  text: string
  buttons?: BnTourButton[]
}

export interface UseTourOptions {
  tourId: string
  steps: BnStepOptions[]
  shepherdOptions?: TourOptions
}

export interface UseTourReturn {
  startTour: () => void
  resetTour: () => void
  isTourActive: Readonly<Ref<boolean>>
  isTourCompleted: Readonly<Ref<boolean>>
  tourInstance: Ref<ShepherdTour | null>
}

const ALLOWED_TOUR_ACTIONS = ['next', 'back', 'complete', 'cancel'] as const
type TourAction = (typeof ALLOWED_TOUR_ACTIONS)[number]

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

export function useTour (options: UseTourOptions): UseTourReturn {
  if (!options.tourId || !options.steps?.length) {
    throw new Error('useTour: tourId et steps sont requis')
  }

  const { tourId, steps, shepherdOptions } = options

  const tourInstance = ref<ShepherdTour | null>(null)
  const isTourActive = ref(false)
  const isTourCompleted = ref(safeLocalStorage(`tour-completed-${tourId}`) === 'true')

  const appInstances: App[] = []

  const onTourEnd = () => {
    isTourActive.value = false
    isTourCompleted.value = true
    localStorage.setItem(`tour-completed-${tourId}`, 'true')
  }

  const cleanupInstances = () => {
    appInstances.forEach((app) => {
      try {
        app.unmount()
      } catch (error) {
        console.warn('Erreur lors du démontage de l\'instance Vue: ', error)
      }
    })
    appInstances.length = 0
  }

  const initTour = () => {
    if (tourInstance.value) {
      return
    }

    const defaultOptions: TourOptions = {
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-custom-class',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true,
          label: 'Fermer le tutoriel',
        },
      },
    }

    const finalOptions = { ...defaultOptions, ...shepherdOptions }

    const tour = new Shepherd.Tour(finalOptions)

    const bnSteps = steps.map((bnStep) => {
      const { title, text, buttons = [], ...restOfStepOptions } = bnStep

      return {
        ...restOfStepOptions,
        title,

        text: () => {
          const container = document.createElement('div')

          const app = createApp(BnTourStep, {
            text,
            buttons,
            onAction: (actionName: string) => {
              const currentTour = tourInstance.value
              if (!currentTour) {
                return
              }

              if (ALLOWED_TOUR_ACTIONS.includes(actionName as TourAction)) {
                try {
                  (currentTour as any)[actionName]()
                } catch (error) {
                  console.error(`Erreur lors de l'exécution de l'action ${actionName}: `, error)
                }
              } else {
                console.warn(`Action de tour inconnue: ${actionName}`)
              }
            },
          })

          app.mount(container)
          appInstances.push(app)

          return container
        },
        buttons: [],
      } as StepOptions
    })

    tour.addSteps(bnSteps)

    tour.on('show', () => {
      isTourActive.value = true
    })
    tour.on('complete', () => {
      cleanupInstances()
      onTourEnd()
    })
    tour.on('cancel', () => {
      cleanupInstances()
      onTourEnd()
    })
    tourInstance.value = tour
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
      if (tourInstance.value?.isActive()) {
        tourInstance.value.cancel()
      }
      cleanupInstances()
      tourInstance.value = null
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
