const LUHN_ALGORITHM_KEY = 42
const LUHN_ALGORITHM_KEY_SIZE = LUHN_ALGORITHM_KEY.toString().length

export const padZero = (num: number, places: number): string => {
  if (places < 0) {
    throw new Error('Zero pad places must be greater than 0')
  }
  return String(num).padStart(places, '0')
}

export const computeLuhn = (source: string, mod = 10): number => {
  let total = 0
  let alternate = false
  if (isNaN(+source)) {
    throw new Error('Source is not a valid number')
  }
  for (let i = source.length - 1; i >= 0; i--) {
    let n = Number(source[i])
    if (alternate) {
      n *= 2
      if (n > 9) {
        n = (n % 10) + 1
      }
    }
    total += n
    alternate = !alternate
  }
  return mod - (total % mod)
}

const addLuhnToRnf = (rnfWithoutLuhn: string): string => {
  const noDash = rnfWithoutLuhn.replace(/-/g, '')
  let onlyNumbersString = ''
  for (let i = 0; i < noDash.length; i++) {
    onlyNumbersString += noDash.charCodeAt(i).toString()
  }
  const luhn = computeLuhn(onlyNumbersString)
  return `${rnfWithoutLuhn}-${padZero(luhn, LUHN_ALGORITHM_KEY_SIZE)}`
}

export const isRnfLuhnValid = (rnf: string): boolean => {
  const rnfWithoutLuhn = rnf.slice(0, -LUHN_ALGORITHM_KEY_SIZE - 1)
  return rnf === addLuhnToRnf(rnfWithoutLuhn)
}
