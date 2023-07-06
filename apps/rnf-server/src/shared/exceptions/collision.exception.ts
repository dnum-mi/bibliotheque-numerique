import { HttpException } from "@nestjs/common";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";
import { InfoDSOutputDto } from "../../modules/foundation/objects/dto/info-ds-output.dto";

export class CollisionException extends HttpException {
  constructor(private _currentFoundation: CreateFoundationDto, private _foundations: FoundationEntity[], private _ds: InfoDSOutputDto) {
    super("Foundations have been found", 409);
  }

  get foundations() {
    return this._foundations;
  }

  get currentFoundation() {
    return this._currentFoundation;
  }

  get ds() {
    return this._ds;
  }
}
