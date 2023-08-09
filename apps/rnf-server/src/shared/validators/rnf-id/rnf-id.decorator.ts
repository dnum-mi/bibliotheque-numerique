import { registerDecorator, ValidationOptions } from 'class-validator'
import { RnfIdConstraint } from '@/shared/validators/rnf-id/rnf-id.constraint'

export function isRnfIdValid (validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isRnfIdValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: RnfIdConstraint,
    })
  }
}
