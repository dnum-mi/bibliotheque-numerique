export const isAssociation = (param?: string) => {
  return param ? param.startsWith('W') : false
}
