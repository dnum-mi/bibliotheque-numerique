import { HttpException, HttpStatus } from '@nestjs/common'
import { ValidationError } from 'class-validator'

export type CustomValidationError = {
  field: string
  value: string | null
  constraints: {
    [type: string]: string;
  }
}

export class CustomValidationException extends HttpException {
  get validationErrors(): CustomValidationError[] {
    return this._validationErrors.map((error) => ({
      field: error.property,
      value: error.target[error.property] || null,
      constraints: error.constraints,
    }))
  }

  constructor(private _validationErrors: ValidationError[]) {
    super('Validation failed', HttpStatus.BAD_REQUEST)
  }
}
