export const toDate = (dateStr: string) => {
  return dateStr ? new Date(dateStr) : undefined;
};
