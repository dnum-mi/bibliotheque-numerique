import type { DynamicKeys, ISearchDossier } from '@biblio-num/shared'
import { PaginationDto } from '@/shared/pagination/pagination.dto'

export class SearchDossierDto extends PaginationDto<DynamicKeys> implements ISearchDossier {
}
