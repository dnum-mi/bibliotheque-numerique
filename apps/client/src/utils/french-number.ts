export const frenchFormatNumber = (value: number):string => {
  if (isNaN(value)) {
    return ''
  }
  return new Intl.NumberFormat('fr-FR').format(value)
}
