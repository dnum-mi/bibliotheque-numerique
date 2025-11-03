import {
  eOrganismeType,
  IOrganisme,
  IRnaAdrsAddress,
  ISiafAddress,
  IAssociationOutput,
} from '@biblio-num/shared'
import { getDissolvedAt } from '../providers/organisme.utils'

type keyofRnaAddress = (keyof IRnaAdrsAddress)

export class TransformRna {
  addressSiege: ISiafAddress
  rnaAddressSiege: IRnaAdrsAddress
  organisme: IAssociationOutput

  constructor(
    organisme: IAssociationOutput,
  ) {
    this.organisme = organisme
    this.addressSiege = organisme.address
    this.rnaAddressSiege = this.addressSiege?.rnaAddress?.address as IRnaAdrsAddress
  }

  getRnaAddressStreetAddress(): string | null {
    return this.rnaAddressSiege
      ? (['numvoie', 'typevoie', 'libvoie'] as keyofRnaAddress[])
        .map((k) => this.rnaAddressSiege[k])
        .filter((a) => !!a)
        .join(' ')
      : null
  }

  getAddressStreetAddress():string | null {
    return this.addressSiege.dsAddress?.streetAddress ||
    this.addressSiege.rnaAddress?.gouvAddress?.name ||
    this.getRnaAddressStreetAddress()
  }

  getAddressLabel(): string | null {
    return this.addressSiege.oneLine ||
    this.addressSiege.dsAddress?.label ||
    this.addressSiege.rnaAddress?.gouvAddress?.label ||
      this.rnaAddressSiege
      ? `${this.getRnaAddressStreetAddress()} ${(['codepostal', 'libcommune'] as keyofRnaAddress[])
        .map((k) => this.rnaAddressSiege[k])
        .filter((a) => !!a)
        .join(' ')}`
      : null
  }

  toOrganisme():IOrganisme {
    return {
      idRna: this.organisme.id,
      type: eOrganismeType.ASSO,
      title: this.organisme.title,
      email: this.organisme.email,
      phoneNumber: this.organisme.phone,
      dateDissolution: getDissolvedAt(this.organisme),
      dateCreation: this.organisme.creationAt,
      rnaJson: this.organisme,
      addressLabel: this.getAddressLabel(),
    } as IOrganisme
  }
}
