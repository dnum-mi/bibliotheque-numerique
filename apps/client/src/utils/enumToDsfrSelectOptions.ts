export const enumToDsfrSelectOptions = (options: Record<string, string>) => {
  return Object.keys(options).map(key => {
    return { text: options[key], value: key }
  })
}
