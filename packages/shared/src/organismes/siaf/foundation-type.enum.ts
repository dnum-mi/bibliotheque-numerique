/**
 * @deprecated
 */
// De Saif-RNF - A modifier ou à supprimer à intergration du Hub
import { createEnum } from "../../factories"


/**
 * @deprecated
 */
// all tags here create tab in organisme page
export const foundationType = [
  'unknown',
  'FDD',
  'FE',
  'FRUP',
] as const

/**
 * @deprecated
 */
export type FoundationTypeKey = (typeof foundationType)[number]
/**
 * @deprecated
 */
export const eFoundationType = createEnum(foundationType)
