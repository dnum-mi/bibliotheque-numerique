export const filterObjectFields = <T>(
  fields: string[],
  object: T,
): Partial<T> => {
  return fields.reduce((acc, field) => {
    acc[field] = object[field];
    return acc;
  }, {});
};
