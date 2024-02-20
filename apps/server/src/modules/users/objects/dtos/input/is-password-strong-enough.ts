import { registerDecorator, ValidationOptions } from 'class-validator'

import {
  isString,
  isLongerThan15,
  containsSpecialChars,
} from '@biblio-num/shared'

// this function cannot be inside shared-utils because it uses class-validator
export function IsPasswordStrongEnough (validationOptions?: ValidationOptions) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return function (object: Record<string, any>, propertyName: string):void {
    registerDecorator({
      name: 'IsPasswordStrongEnough',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate (value: string) {
          return [
            isString,
            isLongerThan15,
            containsSpecialChars,
          ]
            .every(fn => fn(value))
        },
      },
    })
  }
}
