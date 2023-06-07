import { PeopleInFoundation, FoundationRole } from "@prisma/client";
import { IsArray, IsDefined, IsEnum } from "class-validator";
import { PeopleEntity } from "@/modules/people/objects/people.entity";
import { BaseEntityOnlyDates } from "@/shared/base-entity/base.entity";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { FoundationHistoryEntity } from "@/modules/foundation/objects/foundation-history.entity";

export class PeopleInFoundationEntity extends BaseEntityOnlyDates implements PeopleInFoundation {
  @IsDefined()
  peopleId: number;

  @IsDefined()
  foundationId: number;

  @IsDefined()
  foundationHistoryId: number;

  @IsArray()
  @IsEnum(FoundationRole, { each: true })
  roles: FoundationRole[];

  people?: PeopleEntity;
  foundation?: FoundationEntity;
  foundationHistory?: FoundationHistoryEntity;
}
