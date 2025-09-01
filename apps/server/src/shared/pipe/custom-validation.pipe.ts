import {
  Injectable,
  PipeTransform,
  ValidationError,
  ValidationPipe as BaseValidationPipe,
} from '@nestjs/common'
import { CustomValidationException } from '../exceptions/custom-validation.exception'

@Injectable()
export class CustomValidationPipe
  extends BaseValidationPipe
  implements PipeTransform<unknown> {
  constructor() {
    super({
      transform: true,
      skipMissingProperties: false,
      exceptionFactory: (errors: ValidationError[]) =>
        new CustomValidationException(errors),
    })
  }
}
