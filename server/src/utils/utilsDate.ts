export const toDate = (dateStr: string | number) => {
  const date = dateStr ? new Date(dateStr) : undefined;
  if (!date) {
    return undefined;
  }
  return date.getTime() > 0 ? date : undefined;
};
