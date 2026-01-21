import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import { SortDto } from './sort.dto'
import { CreateViewDto } from '@/modules/views/objects/dtos/create-view.dto'

// reduceExistInColumn
const reic = (array: string[] | undefined, o: CreateViewDto):boolean => {
  return (array || []).reduce(
    (acc, curr) => acc && o.columns?.includes(curr),
    true,
  )
}

@ValidatorConstraint({ async: false })
export class ColumnContainsKeyContraint implements ValidatorConstraintInterface {
  validate (useless: unknown, args: ValidationArguments):boolean {
    const o: CreateViewDto = args.object as CreateViewDto
    const propertyName = args.property as keyof CreateViewDto
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

  defaultMessage ():string {
    return 'The selected columns does not contain the column you are trying to use.'
  }
}
