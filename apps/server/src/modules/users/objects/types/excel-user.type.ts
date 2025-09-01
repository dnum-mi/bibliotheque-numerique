export type ExcelUser = {
  Email: string
  Nom: string
  Prénom: string
  Poste: string
  Préfecture: number | string // 75 can be interpreted as bumber for excel
  Role: string
  'Liste des démarches': string | number // any id alone is a number too
  'Liste des départements': number | string // same
}
