import { ApiProperty } from "@nestjs/swagger";

export class RnfIdOutputDto {
  @ApiProperty()
  rnfId: string;
}
