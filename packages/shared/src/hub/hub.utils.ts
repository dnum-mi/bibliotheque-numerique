import { IAssociationOutput, IFoundationOutput } from '../organismes'
import { IBasicOrganisme } from './basic-organisme.interface'
import { organismeStateArrayKey } from './organisme-state.enum'

export const fromFoundationToBasicOrganisme = (source: IFoundationOutput): IBasicOrganisme => ({
    id: source.id,
    state: source.state as organismeStateArrayKey,
    title: source.title,
    city: source.address?.dsAddress?.cityName || "",
    postalCode: source.address?.dsAddress?.postalCode || "",
    type: source.foundationType,
  })

export const fromAssociationToBasicOrganisme = (source: IAssociationOutput): IBasicOrganisme => ({
  id: source.id,
  state: source.state as organismeStateArrayKey,
  title: source.title,
  city: source.address?.dsAddress?.cityName
    || source.address?.rnaAddress?.address?.libcommune
    || "",
  postalCode: source.address?.dsAddress?.postalCode
    || source.address?.rnaAddress?.address?.codepostal
    || "",
  type: "ASSO",
})
