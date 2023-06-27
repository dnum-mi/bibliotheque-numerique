import { IsBoolean, IsDefined, IsEmail, IsNumber, IsOptional, Min } from "class-validator";

export class DossierNumberInputDto {
  @IsDefined()
  @IsNumber()
  @Min(0)
  dossierId: number;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  forceCreate?: boolean;
}
