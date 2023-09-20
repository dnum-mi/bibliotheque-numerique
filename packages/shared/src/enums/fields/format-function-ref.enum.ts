export const FormatFunctionRef = {
  country: 'country',
  status: 'status',
  delayStatus: 'delay-status',
  remainingTime: 'remaing-time',
}

export type FormatFunctionRefKeys =
  (typeof FormatFunctionRef)[keyof typeof FormatFunctionRef];
