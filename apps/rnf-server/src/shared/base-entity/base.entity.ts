import { IsDate, IsDefined, IsNumber } from 'class-validator'

export class BaseEntityOnlyDates {
  @IsDate()
  @IsDefined()
    createdAt: Date

  @IsDate()
  @IsDefined()
    updatedAt: Date
}

export class BaseEntity extends BaseEntityOnlyDates {
  @IsNumber()
  @IsDefined()
    id: number
}
