// TODO: duplicate from rnf-server
import { registerDecorator, ValidationOptions } from 'class-validator'
import { RnfIdConstraint } from './rnf-id.constraint'

export function isRnfIdValid (validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string):void {
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
