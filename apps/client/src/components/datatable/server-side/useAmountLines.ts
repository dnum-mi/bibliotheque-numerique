import { useEventListener } from '@vueuse/core'

function getSublineIndex (cell: Element, amountLine: Element): number {
  let sublineIndex = -1
  cell.querySelectorAll('.amount-line').forEach((el, idx) => {
    if (el === amountLine) {
      sublineIndex = idx
    }
  })
  return sublineIndex
}

function toggleAmountLineHighlight (
  line: Element,
  sublineIndex: number,
  action: 'add' | 'remove',
): void {
  line.querySelectorAll('td').forEach((td) => {
    const sublines = td.querySelectorAll('.amount-line')
    if (sublines.length === 1) {
      return
    }
    const subline = sublines[sublineIndex]
    if (subline instanceof HTMLElement) {
      subline.classList[action]('amount-line-highlighted')
    }
  })
}

export function useAmountLines (): void {
  useEventListener(document, 'mouseover', (event) => {
    if (event.target instanceof HTMLElement) {
      const amountLine = event.target.closest('.amount-line')
      const cell = amountLine?.closest('td')
      const line = amountLine?.closest('tr')
      if (amountLine && cell && line) {
        const sublineIndex = getSublineIndex(cell, amountLine)
        toggleAmountLineHighlight(line, sublineIndex, 'add')
      }
    }
  })

  useEventListener(document, 'mouseout', (event) => {
    if (event.target instanceof HTMLElement) {
      const amountLine = event.target.closest('.amount-line')
      const cell = amountLine?.closest('td')
      const line = amountLine?.closest('tr')
      if (amountLine && cell && line) {
        const sublineIndex = getSublineIndex(cell, amountLine)
        toggleAmountLineHighlight(line, sublineIndex, 'remove')
      }
    }
  })
}
