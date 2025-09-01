export const frenchFormatNumber = (value: number): string => {
  if (Number.isNaN(value)) {
    return ''
  }
  return new Intl.NumberFormat('fr-FR').format(value)
}

export const formatCurrency = (value: number, locale = 'fr-FR', currency = 'EUR'): string => {
  if (Number.isNaN(value)) {
    return ''
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}
