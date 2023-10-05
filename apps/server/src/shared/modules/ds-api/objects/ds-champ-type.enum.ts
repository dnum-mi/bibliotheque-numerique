export const DsChampType = {
  UnknownChamp: 'UnknownChamp',
  AddressChamp: 'AddressChamp',
  CarteChamp: 'CarteChamp',
  CheckboxChamp: 'CheckboxChamp',
  CiviliteChamp: 'CiviliteChamp',
  CommuneChamp: 'CommuneChamp',
  DateChamp: 'DateChamp',
  DatetimeChamp: 'DatetimeChamp',
  DecimalNumberChamp: 'DecimalNumberChamp',
  DepartementChamp: 'DepartementChamp',
  DossierLinkChamp: 'DossierLinkChamp',
  EpciChamp: 'EpciChamp',
  IntegerNumberChamp: 'IntegerNumberChamp',
  LinkedDropDownListChamp: 'LinkedDropDownListChamp',
  MultipleDropDownListChamp: 'MultipleDropDownListChamp',
  PaysChamp: 'PaysChamp',
  PieceJustificativeChamp: 'PieceJustificativeChamp',
  RegionChamp: 'RegionChamp',
  RepetitionChamp: 'RepetitionChamp',
  SiretChamp: 'SiretChamp',
  TextChamp: 'TextChamp',
  TitreIdentiteChamp: 'TitreIdentiteChamp',

  // technically those are TextChamp for DS, with RNA or RNF ChampDescriptor
  RnaChamp: 'RnaChamp',
  RnfChamp: 'RnfChamp',
}

export type DsChampTypeKeys = (typeof DsChampType)[keyof typeof DsChampType]
