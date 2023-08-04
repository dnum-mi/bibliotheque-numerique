import { PersonInFoundation, FoundationRole } from "@prisma/client";
import { IsArray, IsDefined, IsEnum } from "class-validator";
import { PersonEntity } from "@/modules/person/objects/person.entity";
import { BaseEntityOnlyDates } from "@/shared/base-entity/base.entity";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { FoundationHistoryEntity } from "@/modules/foundation/objects/foundation-history.entity";

export class PersonInFoundationEntity extends BaseEntityOnlyDates implements PersonInFoundation {
  @IsDefined()
  personId: number;

  @IsDefined()
  foundationId: number;

  @IsDefined()
  foundationHistoryId: number;

  @IsArray()
  @IsEnum(FoundationRole, { each: true })
  roles: FoundationRole[];

  person?: PersonEntity;
  foundation?: FoundationEntity;
  foundationHistory?: FoundationHistoryEntity;
}
