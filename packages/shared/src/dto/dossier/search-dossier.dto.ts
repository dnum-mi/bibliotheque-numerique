import { PaginationDto } from '../pagination'

/*
    Because we really paginate field of dossier, and not dossier itself, we cannot know the keyof Dossier.
    This is why we use this DynamicKeys type to have any string as keyof T for PaginatedDto
 */
export type DynamicKeys = {
  [key: string]: string;
};

export class SearchDossierDto extends PaginationDto<DynamicKeys> {
}
