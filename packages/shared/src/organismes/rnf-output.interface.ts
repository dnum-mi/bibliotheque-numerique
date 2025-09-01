import { IAddress } from "./address.interface"
import { IPersonBase } from "./person-interface"

export interface IPersonRnf {
  roles: string[],
  person: IPersonBase,
}
//TODO: A supprimer, l'ancien RNF n'existe plus
export interface IRnfOutput {
  id: string
  createdAt: Date
  originalCreatedAt: Date
  rnfId: string
  title: string
  type: string
  department: string
  email: string
  phone: string
  dissolvedAt: Date | null
  fiscalEndDateAt: Date | null
  status?: {
    uuid: string
    name: string
    path: string
    originalName: string
    checksum: string
    byteSize: number
    mimeType: string
  } | null
  declarationYears: number[]
  address?: IAddress | null
  persons: IPersonRnf[]
}
