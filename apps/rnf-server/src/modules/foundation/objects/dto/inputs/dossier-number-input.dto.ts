import { IsDefined, IsEmail, IsNumber, Min } from "class-validator";

export class DossierNumberInputDto {
  @IsDefined()
  @IsNumber()
  @Min(0)
  dossierId: number;

  @IsDefined()
  @IsEmail()
  email: string;
}
