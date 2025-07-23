import { PersonRoleKey, IDissolved, IStatus, ISiafAddress } from '@biblio-num/shared'
import {
  ISiafRnfHistoryOutput,
  ISiafRnfOutput,
  Person,
} from '@biblio-num/shared/src/organismes/siaf/siaf-rnf-output.interface'
import { ApiProperty } from '@nestjs/swagger'

class SiafRnfPersonOutputDto implements Person {
  @ApiProperty()
  civility: string | undefined

  @ApiProperty()
  lastName: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  email: string | undefined

  @ApiProperty()
  phone: string | undefined

  @ApiProperty()
  profession: string

  @ApiProperty()
  nationality: string

  @ApiProperty()
  bornAt: Date

  @ApiProperty()
  bornPlace: string | undefined

  @ApiProperty()
  isFounder: boolean

  @ApiProperty()
  role: PersonRoleKey

  @ApiProperty()
  address: ISiafAddress

  @ApiProperty()
  residenceCountry: string

  @ApiProperty()
  entryDate?: Date

  @ApiProperty()
  exitDate?: Date

  @ApiProperty()
  jobPosition: string
}

class SiafRnfOutputDto implements ISiafRnfOutput {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the RNF history entry',
  })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  email: string

  @ApiProperty()
  phone: string

  @ApiProperty({ type: [String] })
  websites: string[]

  @ApiProperty({ enum: ['unknown', 'FDD', 'FE', 'FRUP'] })
  foundationType: 'unknown' | 'FDD' | 'FE' | 'FRUP'

  @ApiProperty()
  department: string

  @ApiProperty()
  originalDepartment: string

  @ApiProperty({ type: Date })
  originalCreatedAt: Date

  @ApiProperty({ type: Object })
  dissolved: IDissolved

  @ApiProperty({ type: Object })
  status: IStatus

  @ApiProperty({ type: Object })
  address: ISiafAddress

  @ApiProperty({ type: Date })
  fiscalEndDateAt: Date

  @ApiProperty({ type: [Number] })
  declarationYears: number[]

  @ApiProperty({ type: [SiafRnfPersonOutputDto] })
  persons: SiafRnfPersonOutputDto[]

  @ApiProperty({ required: false })
  objectDescription?: string

  @ApiProperty({ type: Date, required: false })
  dueDate?: Date

  @ApiProperty({ required: false })
  generalInterest?: string

  @ApiProperty({ required: false })
  internationalAction?: boolean

  @ApiProperty()
  description: string

  @ApiProperty({ type: Date })
  createdAt: Date

  @ApiProperty({ type: Date })
  updatedAt: Date
}

export class SiafRnfHistoryOutputDto implements ISiafRnfHistoryOutput {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the RNF history entry',
  })
  id: string

  @ApiProperty({
    type: String,
    description:
      'The unique identifier of the foundation associated with this RNF history entry',
  })
  foundationId: string

  @ApiProperty({
    type: Number,
    description: 'The version number of the RNF entry',
  })
  version: number

  @ApiProperty({
    type: SiafRnfOutputDto,
    description: 'The foundation data associated with this RNF history entry',
  })
  foundation: SiafRnfOutputDto

  @ApiProperty({
    type: Date,
    description: 'The date and time when the RNF history entry was created',
  })
  createdAt: Date

  @ApiProperty({
    type: Date,
    description:
      'The date and time when the RNF history entry was last updated',
  })
  updatedAt: Date
}
