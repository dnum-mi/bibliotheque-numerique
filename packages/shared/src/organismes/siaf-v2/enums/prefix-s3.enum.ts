import { createEnum } from "factories"

export const prefixs3Array = [
  "rna",
  "association",
  "fondation",
] as const

export type PrefixS3Key = (typeof prefixs3Array)[number]
export const ePrefixS3 = createEnum(prefixs3Array)
