// TODO: duplicate from rnf-server
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { isRnfLuhnValid } from '@/shared/utils/rnf.utils'

@ValidatorConstraint({ async: false })
export class RnfIdConstraint implements ValidatorConstraintInterface {
  validate (text: string):boolean {
    if (!text) return false
    return text.length >= 15 && text.length <= 18 && isRnfLuhnValid(text)
  }

  defaultMessage ():string {
    return "Le numéro RNF n'est pas valide"
  }
}
