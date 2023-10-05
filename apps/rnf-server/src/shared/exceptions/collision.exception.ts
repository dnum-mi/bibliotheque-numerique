import { HttpException } from '@nestjs/common'
import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { InfoDSOutputDto } from '@/modules/foundation/objects/dto/info-ds-output.dto'
import { GetFoundationOutputDto } from '@/modules/foundation/objects/dto/outputs/get-foundation-output.dto'

export class CollisionException extends HttpException {
  constructor (
    private _currentFoundation: CreateFoundationDto,
    private _foundations: GetFoundationOutputDto[],
    private _ds: InfoDSOutputDto,
  ) {
    super('Foundations have been found', 409)
  }

  get foundations () {
    return this._foundations
  }

  get currentFoundation () {
    return this._currentFoundation
  }

  get ds () {
    return this._ds
  }
}
