export interface IAddress {
  label: string
  type: string
  streetAddress: string | null
  streetNumber: string | null
  streetName: string | null
  postalCode: string
  cityName: string
  cityCode: string
  departmentName: string | null
  departmentCode: string
  regionName: string | null
  regionCode: string | null
}
