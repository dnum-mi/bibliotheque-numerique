import { registerDecorator, ValidationOptions } from 'class-validator'

import { isString, isLongerThan12, containsSpecialChars } from '../../utils'

export function IsPasswordStrongEnough (validationOptions?: ValidationOptions) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsPasswordStrongEnough',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate (value: string) {
          return [
            isString,
            isLongerThan12,
            containsSpecialChars,
          ]
            .every(fn => fn(value))
        },
      },
    })
  }
}
