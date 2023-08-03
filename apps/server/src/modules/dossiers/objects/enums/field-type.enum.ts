export const FieldType = {
  string: "string",
  number: "number",
  date: "date",
  boolean: "boolean",
};

export type FieldTypeKeys = (typeof FieldType)[keyof typeof FieldType];
