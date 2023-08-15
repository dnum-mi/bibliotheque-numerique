import { DynamicKeys } from '../objects/dto/search-dossier.dto';
import { SortDto } from '@biblio-num/shared';

export const buildPaginationQuery = (page: number, perPage: number): string => {
  return `OFFSET ${(page-1) * perPage} LIMIT ${perPage}`;
}

export const buildSortQuery = (sorts: SortDto<DynamicKeys>[], hashColumns: Record<string, string>,): string => {
  return !sorts?.length ? '' : `ORDER BY ${
    sorts
      .filter(s => hashColumns[s.key])
      .map(s => `${hashColumns[s.key]} ${s.order}`)
      .join(', ')
  }`;
}

export const buildFilterQuery = (): string => {
  return ``
}
