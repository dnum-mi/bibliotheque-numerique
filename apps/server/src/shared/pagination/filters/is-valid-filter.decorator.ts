import {
  registerDecorator,
  validateSync,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'
import { plainToClass } from 'class-transformer'
import { FilterTextDto } from './string.filter.dto'
import { FilterDateDto } from './date.filter.dto'
import { FilterNumberDto } from './number.filter.dto'
import { FilterEnumDto } from './enum.filter.dto'

export function IsValidFilter (validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (object: any, propertyName: string):void => {
    registerDecorator({
      name: 'isValidFilter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        validate (value: any, args: ValidationArguments): boolean {
          if (typeof value !== 'object') {
            return false
          }

          for (const key in value) {
            const filter = value[key]
            switch (filter.filterType) {
            case 'text':
              if (
                !validateSync(plainToClass(FilterTextDto, filter))?.length
              ) {
                continue
              }
              return false
            case 'date':
              if (
                !validateSync(plainToClass(FilterDateDto, filter))?.length
              ) {
                continue
              }
              return false
            case 'number':
              if (
                !validateSync(plainToClass(FilterNumberDto, filter))?.length
              ) {
                continue
              }
              return false
            case 'set':
              if (
                !validateSync(plainToClass(FilterEnumDto, filter))?.length
              ) {
                continue
              }
              return false
            default:
              return false
            }
          }
          return true
        },
      },
    })
  }
}
