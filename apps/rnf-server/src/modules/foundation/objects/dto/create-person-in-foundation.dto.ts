import { FoundationRole } from "@prisma/client";
import { IsDefined, IsEnum } from "class-validator";
import { CreatePersonDto } from "@/modules/person/objects/dto/create-person.dto";
import { Type } from "class-transformer";

export class CreatePersonInFoundationDto {
  @IsDefined()
  @Type(() => CreatePersonDto)
  person: CreatePersonDto;

  @IsDefined()
  @IsEnum(FoundationRole)
  role: FoundationRole;
}
