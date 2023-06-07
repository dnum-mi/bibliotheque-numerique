import { IsDefined, IsNumber, Min } from "class-validator";

export class DossierNumberInputDto {
  @IsDefined()
  @IsNumber()
  @Min(0)
  dossierId: number;
}
