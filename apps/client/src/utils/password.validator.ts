import { z } from 'zod'
import { PASSWORD_MESSAGE } from '../messages'

const PASSWORD_NO_EMPTY_MESSAGE = 'Veuillez saisir un mot de passe'
export const passwordValidator = z.string({ required_error: PASSWORD_NO_EMPTY_MESSAGE })
  .nonempty(PASSWORD_NO_EMPTY_MESSAGE)
  .min(15, PASSWORD_MESSAGE)
  .regex(/[a-z]/, PASSWORD_MESSAGE)
  .regex(/[A-Z]/, PASSWORD_MESSAGE)
  .regex(/[0-9]/, PASSWORD_MESSAGE)
  .regex(/[!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/, PASSWORD_MESSAGE)
