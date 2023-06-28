import { HttpException } from "@nestjs/common";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";

export class CollisionException extends HttpException {
  constructor(private _currentFoundation: CreateFoundationDto, private _foundations: FoundationEntity[]) {
    super("Foundations have been found", 409);
  }

  get foundations() {
    return this._foundations;
  }

  get currentFoundation() {
    return this._currentFoundation;
  }
}
