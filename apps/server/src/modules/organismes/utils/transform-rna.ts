import {
  eAddressKind,
  eOrganismeType,
  IAddressRna,
  IOrganisme,
  IRnaAdrsAddress,
  ISiafRnaOutput,
} from '@biblio-num/shared'

type keyofRnaAddress = (keyof IRnaAdrsAddress)

export class TransformRna {
  addressSiege: IAddressRna
  addressGestion: IAddressRna
  rnaAddressSiege: IRnaAdrsAddress
  organisme: ISiafRnaOutput

  constructor(
    organisme: ISiafRnaOutput,
  ) {
    this.organisme = organisme
    this.addressSiege = organisme.addresses.filter(a => a.rnaAddress.kind === eAddressKind.adrs)[0]
    this.addressGestion = organisme.addresses.filter(a => a.rnaAddress.kind === eAddressKind.adrg)[0]
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
    return this.addressSiege.gouvAddress?.name ||
    this.addressSiege.dsAddress.streetAddress ||
    this.getRnaAddressStreetAddress()
  }

  getAddressLabel(): string | null {
    return this.addressSiege.gouvAddress.label ||
      this.addressSiege.dsStringValue ||
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
      email: this.organisme.emails.join(', '),
      phoneNumber: this.organisme.phones.join(', '),
      dateDissolution: this.organisme.dissolved?.dissolvedAt,
      dateCreation: this.organisme.createdAt,
      rnaJson: this.organisme,
      addressLabel: this.getAddressLabel(),
    } as IOrganisme
  }
}
