import { registerDecorator, ValidationOptions } from 'class-validator';

const isLongerThan12 = isLongerThan(12)
const containsSpecialChars = contains('#!@;-:') // TODO: Check the special characters to be included

export function IsPasswordStrongEnough(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPasswordStrongEnough',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return [
            isString,
            isLongerThan12,
            containsSpecialChars
          ]
            .every(fn => fn(value))
        },
      },
    });
  };
}

// TODO: Move this in a util package, maybe?

function isString (value: any): boolean {
  return typeof value === 'string'
}

function isLongerThan (minLength: number): (value: string) => boolean {
  return value => value.length >= minLength
}

function contains (chars: string) {
  return (value: string) => chars.split('').every(char => value.includes(char))
}