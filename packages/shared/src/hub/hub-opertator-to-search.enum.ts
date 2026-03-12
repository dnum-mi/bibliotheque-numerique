import { createEnum } from 'factories'

export const operatorToSeachArray = [
"eq",
"neq",
"gt",
"gte",
"lt",
"lte",
"in",
"nin",
] as const

export type OperatorToSeachArrayKey = (typeof operatorToSeachArray)[number]
export const eOperatorToSeachArray = createEnum(operatorToSeachArray)
