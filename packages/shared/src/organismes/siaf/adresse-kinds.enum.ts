/**
 * @deprecated
 */

import { createEnum } from "../../factories"

// all tags here create tab in organisme page
/**
 * @deprecated
 */
export const addressKinds = [
  "adrg",
  "adrs",
] as const

/**
 * @deprecated
 */
export type addressKindKey = (typeof addressKinds)[number]
/**
 * @deprecated
 */
export const eAddressKind = createEnum(addressKinds)


