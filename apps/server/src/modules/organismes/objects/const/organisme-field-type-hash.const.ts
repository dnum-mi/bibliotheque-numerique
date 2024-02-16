import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { FieldTypeKeys } from '@biblio-num/shared-utils'

// TODO: maybe there is an elegant way to have this.
export const OrganismeFieldTypeHash: Record<
  keyof Omit<Organisme, 'rnaJson' | 'rnfJson' | 'dossiers'>,
  FieldTypeKeys
> = {
  id: 'number',
  type: 'string',
  title: 'string',
  email: 'string',
  createdAt: 'date',
  updatedAt: 'date',
  phoneNumber: 'string',
  addressType: 'string',
  addressLabel: 'string',
  addressStreetAddress: 'string',
  addressStreetNumber: 'string',
  addressStreetName: 'string',
  addressPostalCode: 'string',
  addressCityName: 'string',
  addressDepartmentName: 'string',
  addressDepartmentCode: 'string',
  addressRegionName: 'string',
  addressRegionCode: 'string',
  dateCreation: 'date',
  dateDissolution: 'date',
  idRna: 'string',
  idRnf: 'string',
}
