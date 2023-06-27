import { HttpException } from "@nestjs/common";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";

export class CollisionException extends HttpException {
  constructor(private _foundations: FoundationEntity[]) {
    super("Foundations have been found", 409);
  }

  get foundations() {
    return this._foundations;
  }
}
