import type { TourOptions, StepOptions, Tour as ShepherdTour } from 'shepherd.js'
import Shepherd from 'shepherd.js'
import type { Ref } from 'vue'
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
  tourInstance: Readonly<Ref<ShepherdTour | null>>
}

export function useTour (options: UseTourOptions): UseTourReturn {
  const { tourId, steps, shepherdOptions } = options

  const tourInstance = ref<ShepherdTour | null>(null)
  const isTourActive = ref(false)
  const isTourCompleted = ref(localStorage.getItem(`tour-completed-${tourId}`) === 'true')

  const onTourEnd = () => {
    isTourActive.value = false
    isTourCompleted.value = true
    localStorage.setItem(`tour-completed-${tourId}`, 'true')
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

          createApp(BnTourStep, {
            text,
            buttons,
            onAction: (actionName: string) => {
              const currentTour = tourInstance.value
              if (!currentTour) {
                return
              }

              if (typeof (currentTour as any)[actionName] === 'function') {
                ;(currentTour as any)[actionName]()
              } else {
                console.warn(`Action de tour inconnue: ${actionName}`)
              }
            },
          }).mount(container)

          return container
        },
        buttons: [],
      } as unknown as StepOptions
    })

    tour.addSteps(bnSteps)

    tour.on('show', () => {
      isTourActive.value = true
    })
    tour.on('complete', onTourEnd)
    tour.on('cancel', onTourEnd)
    tourInstance.value = tour
  }

  const startTour = () => {
    if (!tourInstance.value) {
      initTour()
    }

    setTimeout(() => {
      tourInstance.value?.start()
    }, 100)
  }

  const resetTour = () => {
    localStorage.removeItem(`tour-completed-${tourId}`)
    isTourCompleted.value = false
  }

  onUnmounted(() => {
    if (tourInstance.value?.isActive()) {
      tourInstance.value.cancel()
    }
    tourInstance.value = null
  })

  return {
    startTour,
    resetTour,
    isTourActive: readonly(isTourActive),
    isTourCompleted: readonly(isTourCompleted),
    tourInstance: readonly(tourInstance),
  }
}
