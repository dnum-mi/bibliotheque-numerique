export const toDate = (dateStr: string | number) => {
  const date = dateStr ? new Date(dateStr) : undefined
  if (!date) {
    return undefined
  }
  if (isNaN(date as any)) {
    throw new Error('Invalid date')
  }
  return date
}
