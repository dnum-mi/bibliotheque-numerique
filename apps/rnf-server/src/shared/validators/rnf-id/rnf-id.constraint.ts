import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isRnfLuhnValid } from "@/shared/utils/rnf-id.utils";

@ValidatorConstraint({ async: false })
export class RnfIdConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) return false;
    return text.length >= 16 && text.length <= 18 && isRnfLuhnValid(text);
  }

  defaultMessage(args: ValidationArguments) {
    return "Le numéro RNF n'est pas valide";
  }
}
