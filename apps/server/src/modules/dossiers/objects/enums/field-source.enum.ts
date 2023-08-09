export const FieldSource = {
  champs: 'champs',
  annotation: 'annotation',
  dossier: 'dossier',
}

export type FieldSourceKeys = (typeof FieldSource)[keyof typeof FieldSource];
