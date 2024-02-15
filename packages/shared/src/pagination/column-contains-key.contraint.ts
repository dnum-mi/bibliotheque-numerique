import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import { CreateCustomFilterDto } from '../custom-filters'
import { SortDto } from './sort.dto'

// reduceExistInColumn
const reic = (array: string[] | undefined, o: CreateCustomFilterDto) => {
  return (array || []).reduce(
    (acc, curr) => acc && o.columns.includes(curr),
    true,
  )
}

@ValidatorConstraint({ async: false })
export class ColumnContainsKeyContraint implements ValidatorConstraintInterface {
  validate (useless: unknown, args: ValidationArguments) {
    const o: CreateCustomFilterDto = args.object as CreateCustomFilterDto
    const propertyName = args.property as keyof CreateCustomFilterDto
    let array: string[] = []
    if (propertyName === 'sorts') {
      array = o.sorts?.map((s: SortDto<unknown>) => s.key)
    } else if (propertyName === 'filters') {
      array = Object.keys(o.filters || {})
    } else if (propertyName === 'totals') {
      array = o.totals || []
    }

    return reic(array, o)
  }

  defaultMessage (args: ValidationArguments) {
    return 'The selected columns does not contain the column you are trying to use.'
  }
}
