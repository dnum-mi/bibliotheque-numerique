// TODO: Ajouter une règle pour les dates antérieures à 1970, Postgres "timestamps" ne les supporte pas
const toDateBefore1970 = (date: Date) => undefined;
export const toDate = (dateStr: string | number) => {
  const date = dateStr ? new Date(dateStr) : undefined;
  if (!date) {
    return undefined;
  }
  return date.getTime() < 0 ? toDateBefore1970(date) : date;
};
