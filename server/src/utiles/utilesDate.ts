export const toDate = (dateStr: string | number) => {
  return dateStr ? new Date(dateStr) : undefined;
};
