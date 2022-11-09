export const dateTimeToStringFr = (value:any) => {
  return value
    ? (new Date(value)).toLocaleString('fr-FR')
    : ''
}

export const dateToStringFr = (value:any) => {
  return value
    ? (new Date(value)).toLocaleDateString('fr-FR')
    : ''
}
