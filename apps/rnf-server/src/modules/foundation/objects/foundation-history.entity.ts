import { FoundationHistory, Prisma } from "@prisma/client";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { OmitType } from "@nestjs/swagger";

export class FoundationHistoryEntity extends OmitType(FoundationEntity, ["addressId", "address", "peoples"]) implements FoundationHistory {
  historyNumber: number;
  address: Prisma.JsonValue;
  peoples: Prisma.JsonValue[];
  rawDsJson: Prisma.JsonValue;
}
