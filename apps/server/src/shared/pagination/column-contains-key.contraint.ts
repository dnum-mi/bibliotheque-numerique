import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import { SortDto } from './sort.dto'
import { CreateCustomFilterDto } from '@/modules/custom-filters/objects/dtos/create-custom-filter.dto'

// reduceExistInColumn
const reic = (array: string[] | undefined, o: CreateCustomFilterDto):boolean => {
  return (array || []).reduce(
    (acc, curr) => acc && o.columns.includes(curr),
    true,
  )
}

@ValidatorConstraint({ async: false })
export class ColumnContainsKeyContraint implements ValidatorConstraintInterface {
  validate (useless: unknown, args: ValidationArguments):boolean {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage (args: ValidationArguments):string {
    return 'The selected columns does not contain the column you are trying to use.'
  }
}
