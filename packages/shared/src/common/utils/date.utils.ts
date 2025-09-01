export function toDate(dateStr: string | number) {
  const date = dateStr ? new Date(dateStr) : undefined
  if (!date) {
    return undefined
  }
  if (isNaN(date as any)) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    throw new TypeError('Invalid date')
  }
  return date
}
