import { IRnaFile } from "./common-output.interface"
import { PrefixS3Key, TypeFileKey } from "./enums"

export interface IFile {
  id: string
  createdAt: Date
  updatedAt: Date
  originalName: string
  checksum: string
  byteSize: number
  mimeType: string
  name: string
  uploadedAt: Date
  prefixS3: PrefixS3Key
  typeFile: TypeFileKey | null
  effectiveAt: Date | null
  rnaFile: IRnaFile | null
}
