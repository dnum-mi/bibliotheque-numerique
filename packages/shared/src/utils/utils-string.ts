/* eslint-disable  @typescript-eslint/no-explicit-any */
export function isString (value: any): boolean {
  return typeof value === 'string'
}

export function isLongerThan (minLength: number): (value: string) => boolean {
  return value => value.length >= minLength
}

export function containsAtLeastOneOf (chars: string) {
  return (value: string) => chars.split('').some(char => value.includes(char))
}

export const isLongerThan15 = isLongerThan(15)
export const containsSpecialChars = containsAtLeastOneOf('!@#$%^&*()-_=+[{]}|;:\'",<.>/?') // TODO: Check the special characters to be
