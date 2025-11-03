import { ISiafAddress } from "./common-output.interface"
import { JobPositionKey, qualityInOrganismeKey } from "./enums"

export interface IPerson {
  _id: string
  lastName: string
  firstName: string

  bornAt: Date | null
  address: ISiafAddress | null
  civility: string | null
  email: string | null
  phone: string | null
  profession: string | null
  nationality: string | null
  bornPlace: string | null
  isFounder: boolean
  residenceCountry: string | null
  entryAt: Date | null
  exitAt: Date | null

  quality: qualityInOrganismeKey | null
  role: JobPositionKey | null
}
