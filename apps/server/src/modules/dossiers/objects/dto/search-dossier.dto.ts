import type { DynamicKeys, ISearchDossier } from '@biblio-num/shared-utils'
import { PaginationDto } from '@/shared/pagination/pagination.dto'

export class SearchDossierDto extends PaginationDto<DynamicKeys> implements ISearchDossier {
}
