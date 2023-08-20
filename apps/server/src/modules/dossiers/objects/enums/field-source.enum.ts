export const FieldSource = {
  champs: 'champs',
  annotation: 'annotation',
  fixField: 'fix-field',
}

export type FieldSourceKeys = (typeof FieldSource)[keyof typeof FieldSource];
