export const FormatFunctionRef = {
  country: 'country',
  status: 'status',
  delayStatus: 'delay-status',
  remainingTime: 'remaining-time',
  rnf: 'rnf',
  rna: 'rna',
  file: 'file',
  prefecture: 'prefecture',
  organisme: 'organisme',
}

export type FormatFunctionRefKeys =
  (typeof FormatFunctionRef)[keyof typeof FormatFunctionRef];
