export const pushIfMissing = <T>(array: T[], elem: T): void => {
  if (!array.includes(elem)) {
    array.push(elem)
  }
}
