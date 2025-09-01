const ACCENTED_CHARS = 'àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ'
const BN_CODE_KEY = `([a-zA-Z-${ACCENTED_CHARS}]+)`
const BN_CODE_KEY_REGEX = new RegExp(BN_CODE_KEY)
const BN_CODE_PARTICULE = 'bncode'
export const BN_CODE_COMPLETE_REGEX = new RegExp(
  `(.*)(#${BN_CODE_PARTICULE}-)(${BN_CODE_KEY})(-${BN_CODE_PARTICULE}#)(.*)`,
)

export const fromStringToBnChampCode = (key: string): string => {
  if (!key.match(BN_CODE_KEY_REGEX)) {
    throw new Error('The key is not valid to be converted to a BN code')
  }
  return `#${BN_CODE_PARTICULE}-${key}-${BN_CODE_PARTICULE}#`
}

export const doesTextContainBnCode = (text: string): string | null => {
  return text?.match(BN_CODE_COMPLETE_REGEX)?.[3] ?? null
}

export const durationToString = (expiresIn: string): string => {
  const unités = {
    s: 'secondes',
    m: 'minutes',
    h: 'heure',
    d: 'jours',
  }

  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) return 'Format non reconnu'

  const [, nombre, unité] = match
  return `${nombre} ${unités[unité]}`
}
