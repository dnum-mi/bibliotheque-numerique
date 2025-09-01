export const FormatFunctionRef = {
  country: 'country',
  status: 'status',
  delayStatus: 'delay-status',
  remainingTime: 'remaining-time',
  rnf: 'rnf',
  rna: 'rna',
  file: 'file',
  prefecture: 'prefecture',
}

export type FormatFunctionRefKeys =
  (typeof FormatFunctionRef)[keyof typeof FormatFunctionRef];
