// TODO: Ajouter une règle pour les dates antérieures à 1970, Postgres "timestamps" ne les supporte pas

export const toDate = (dateStr: string | number) => {
  const date = dateStr ? new Date(dateStr) : undefined;
  if (!date) {
    return undefined;
  }
  if (isNaN(date as any)) {
    throw new Error("Invalid date");
  }
  return date;
};
