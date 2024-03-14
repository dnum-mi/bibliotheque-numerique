import { createEnum } from '@biblio-num/shared'

export const fileFieldCodes = [
  'file-initial-status',
  'file-extended-status',
  'file-extended-pv',
  'file-updated-status',
  'file-status-update-pv',
  'file-dissolution-pv',
  'file-dissolution-judgment',
  'file-certified-account',
  'file-public-ressources-account',
  'file-budget-account',
  'file-abrited-account',
  'file-annual-report',
  'file-validated-account-pv',
  'file-financial-state-account',
  'file-certified-financial-state-account',
  'file-fe-account',
  'file-fe-excel',
] as const

export const fieldCodes = [
  ...fileFieldCodes,

  // date used to name files
  'board-decision-at',
  'updated-status-at',
  'dissolution-at',
  'account-year',
  'validated-account-at',
] as const

export type FileFieldCodeKey = (typeof fileFieldCodes)[number]
export const eFileFieldCode = createEnum(fileFieldCodes)

export type FieldCodeKey = (typeof fieldCodes)[number]
export const eFieldCode = createEnum(fieldCodes)
