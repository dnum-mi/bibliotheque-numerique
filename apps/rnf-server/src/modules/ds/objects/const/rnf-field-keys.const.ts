// TODO: check if the escape is really necessary
/* eslint-disable no-useless-escape */
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'

export const rnfFieldKeys: Record<keyof CreateFoundationDto, RegExp> = {
  title: /.*\#rnf\-titre\-rnf\#.*/,
  type: /.*\#rnf\-type\-rnf\#.*/,
  address: /.*\#rnf\-addresse\-rnf\#.*/,
  email: /.*\#rnf\-courriel\-rnf\#.*/,
  phone: /.*\#rnf\-telephone\-rnf\#.*/,
  personInFoundationToCreate: /.*\#rnf\-personne\-rnf\#.*/,
  status: /.*\#rnf\-status\-rnf\#.*/,
}
