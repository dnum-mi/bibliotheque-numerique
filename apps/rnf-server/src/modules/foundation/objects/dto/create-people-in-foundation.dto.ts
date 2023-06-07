import { FoundationRole } from "@prisma/client";
import { IsDefined, IsEnum } from "class-validator";
import { CreatePeopleDto } from "@/modules/people/objects/dto/create-people.dto";
import { Type } from "class-transformer";

export class CreatePeopleInFoundationDto {
  @IsDefined()
  @Type(() => CreatePeopleDto)
  people: CreatePeopleDto;

  @IsDefined()
  @IsEnum(FoundationRole)
  role: FoundationRole;
}
