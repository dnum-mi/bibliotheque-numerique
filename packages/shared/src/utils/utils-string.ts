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

export const isLongerThan12 = isLongerThan(12)
export const containsSpecialChars = containsAtLeastOneOf('#!@;-:*') // TODO: Check the special characters to be included
