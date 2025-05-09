// De Saif-RNF - A modifier ou à supprimer à intergration du Hub
import { createEnum } from "../../factories"

// all tags here create tab in organisme page
export const foundationType = [
  'FDD',
  'FE',
  'FRUP',
] as const

export type FoundationTypeKey = (typeof foundationType)[number]
export const eFoundationType = createEnum(foundationType)
