import { createEnum } from "../../factories"

// all tags here create tab in organisme page
export const addressKinds = [
  "adrg",
  "adrs",
] as const

export type addressKindKey = (typeof addressKinds)[number]
export const eAddressKind = createEnum(addressKinds)


