export const FormatFunctionRef = {
  country: 'country',
  status: 'status',
  delayStatus: 'delay-status',
  remainingTime: 'remaining-time',
  rnf: 'rnf',
  rna: 'rna',
}

export type FormatFunctionRefKeys =
  (typeof FormatFunctionRef)[keyof typeof FormatFunctionRef];
