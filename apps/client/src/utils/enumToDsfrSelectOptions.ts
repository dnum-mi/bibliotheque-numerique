export const enumToDsfrSelectOptions = (options: any) => {
  return Object.keys(options).map(key => {
    return { text: options[key], value: key }
  })
}
