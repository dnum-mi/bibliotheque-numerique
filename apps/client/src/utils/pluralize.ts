export const pluralize = ({ count, singular, plural }: { count: number; singular: string; plural: string }) => {
  return `${count} ${count > 1 ? plural : singular}`
}
