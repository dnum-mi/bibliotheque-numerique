export interface IRnfOutput {
  id: string
  createdAt: string
  rnfId: string
  title: string
  type: string
  department: string
  email: string
  phone: string
  dissolvedAt: Date | null
  status?: {
    uuid: string
    name: string
    path: string
    originalName: string
    checksum: string
    byteSize: number
    mimeType: string
  } | null
  address?: {
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
  } | null
}
