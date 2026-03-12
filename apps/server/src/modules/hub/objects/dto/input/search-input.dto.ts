import {
  eOrganismeTypeToSearch,
  ISearchHubConditionInput,
  ISearchHubInput,
  OrganismeTypeToSearchKey,
} from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'

export class SearchInputDto implements ISearchHubInput {
  @ApiProperty({
    description: 'Phrase de recherche',
    type: String,
  })
  sentence: string

  @ApiProperty({
    description: 'Nombre de résultats attendu',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  size: number | null

  @ApiProperty({
    description: 'Type d\'entité recherché',
    type: String,
    enum: eOrganismeTypeToSearch,
    required: false,
  })
  @IsOptional()
  entityType?: OrganismeTypeToSearchKey | null

  @ApiProperty({
    description: 'Conditions de recherche',
    type: [Object],
    required: false,
  })
  @IsOptional()
  conditions: ISearchHubConditionInput[]
}
