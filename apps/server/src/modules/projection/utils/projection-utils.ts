export const getDossierTableName = (demarcheId: number): string => {
  return `listing_dossier_${demarcheId}`
}

export const getFieldTableName = (demarcheId: number): string => {
  return `listing_field_${demarcheId}`
}
