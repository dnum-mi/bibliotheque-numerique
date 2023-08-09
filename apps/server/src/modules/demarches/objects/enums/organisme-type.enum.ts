export const OrganismeType = {
  unknown: "unknown",
  FDD: "FDD",
  FE: "FE",
  ARUP: "ARUP",
  FRUP: "FRUP",
  W9: "W9",
};

export type OrganismeTypeKeys =
  (typeof OrganismeType)[keyof typeof OrganismeType];

export const organismeTypeRegex: Record<OrganismeTypeKeys, RegExp> = {
  [OrganismeType.FDD]: /^FDD$/,
  [OrganismeType.FE]: /^FE$/,
  [OrganismeType.ARUP]: /^ARUP$/,
  [OrganismeType.FRUP]: /^FRUP$/,
  [OrganismeType.W9]: /^W\d{9}$/,
};
