import { useEventListener } from '@vueuse/core'

export function useAmountLines () {
  useEventListener(document, 'mouseover', (event) => {
    if (event.target instanceof HTMLElement) {
      const amountLine = event.target.closest('.amount-line')
      if (amountLine) {
        const cell = amountLine.closest('td')
        const line = amountLine.closest('tr')
        let sublineIndex = -1
        cell?.querySelectorAll('.amount-line').forEach((el, idx) => {
          if (el === amountLine) {
            sublineIndex = idx
          }
        })
        line?.querySelectorAll('td').forEach((td) => {
          const sublines = td.querySelectorAll('.amount-line')
          if (sublines.length === 1) {
            return
          }
          if (sublines[sublineIndex]) {
            sublines[sublineIndex].classList.add('amount-line-highlighted')
          }
        })
      }
    }
  })

  useEventListener(document, 'mouseout', (event) => {
    if (event.target instanceof HTMLElement) {
      const amountLine = event.target.closest('.amount-line')
      if (amountLine) {
        const cell = amountLine.closest('td')
        const line = amountLine.closest('tr')
        let sublineIndex = -1
        cell?.querySelectorAll('.amount-line').forEach((el, idx) => {
          if (el === amountLine) {
            sublineIndex = idx
          }
        })
        line?.querySelectorAll('td').forEach((td) => {
          const sublines = td.querySelectorAll('.amount-line')
          if (sublines[sublineIndex]) {
            sublines[sublineIndex].classList.remove('amount-line-highlighted')
          }
        })
      }
    }
  })
}
