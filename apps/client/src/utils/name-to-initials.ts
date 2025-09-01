export const getInitialsFromName = (name: string): string => {
  return name.split(' ')
    .filter(word => word.length > 0)
    .reduce((acc, [firstLetter]) => acc + firstLetter, '')
    .toUpperCase()
}
