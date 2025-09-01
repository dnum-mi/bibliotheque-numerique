import { CustomChamp } from '@dnum-mi/ds-api-client'

export type RawChamp = CustomChamp & {
  __typename: string
  rows: { champs: RawChamp[] }[]
}
