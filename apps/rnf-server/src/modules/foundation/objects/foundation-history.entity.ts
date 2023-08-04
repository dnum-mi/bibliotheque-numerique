import { FoundationHistory, Prisma } from "@prisma/client";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { OmitType } from "@nestjs/swagger";

export class FoundationHistoryEntity extends OmitType(FoundationEntity, ["addressId", "address", "persons"]) implements FoundationHistory {
  historyNumber: number;
  address: Prisma.JsonValue;
  persons: Prisma.JsonValue[];
  rawDsJson: Prisma.JsonValue;
}
