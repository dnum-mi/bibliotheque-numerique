import { FieldTypeKeys } from '@biblio-num/shared'
import { User } from '../user.entity'

// TODO: maybe there is an elegant way to have this.
export const UserFieldTypeHashConst: Record<
  keyof Omit<
    User,
    | 'role'
    | 'skipHashPassword'
    | 'password'
    | 'validated'
    | 'hashPassword'
    | 'customFilters'
    | 'removeSkipHashPasswordReference'
  >,
  FieldTypeKeys
> = {
  id: 'number',
  email: 'string',
  lastname: 'string',
  firstname: 'string',
  job: 'string',
  createAt: 'date',
  updateAt: 'date',
}
