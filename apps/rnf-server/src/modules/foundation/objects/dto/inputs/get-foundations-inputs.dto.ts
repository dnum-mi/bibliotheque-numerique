import { IsArray, IsDateString, IsDefined } from "class-validator";
import { isRnfIdValid } from "../../../../../shared/validators/rnf-id/rnf-id.decorator";

export class GetFoundationsInputDto {
  @IsDefined()
  @isRnfIdValid({ each: true })
  rnfIds: string[];

  @IsDateString()
  date: Date;
}
