// TODO: Ajouter une règle pour les dates antérieures à 1970, Postgres "timestamps" ne les supporte pas

// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const toDate = (dateStr: string | number) => {
  const date = dateStr ? new Date(dateStr) : undefined;
  if (!date) {
    return undefined;
  }
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isNaN(date as any)) {
    throw new Error("Invalid date");
  }
  return date;
};
