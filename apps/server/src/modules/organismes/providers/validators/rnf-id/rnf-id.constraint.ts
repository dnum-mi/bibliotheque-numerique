// TODO: duplicate from rnf-server
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { isRnfLuhnValid } from '@/shared/utils/rnf.utils'

@ValidatorConstraint({ async: false })
export class RnfIdConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate (text: string, args: ValidationArguments):boolean {
    if (!text) return false
    return text.length >= 15 && text.length <= 18 && isRnfLuhnValid(text)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage (args: ValidationArguments):string {
    return "Le numéro RNF n'est pas valide"
  }
}
