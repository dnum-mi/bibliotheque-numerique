
export enum eRnaDissolutionType {
  "Dissolution judiciaire" = "Dissolution judiciaire",
  "Dissolution volontaire" = "Dissolution volontaire",
  "Dissolution de droit" = "Dissolution de droit"
}

export enum eRnaEventType {
  "Création" = "Création",
  "Modification" = "Modification",
  "Dissolution" = "Dissolution"
}

export enum eRnaModificationType {
  "Objet" = "Objet",
  "Adhésion" = "Adhésion",
  "Statuts" = "Statuts",
  "Titre" = "Titre",
  "Établissement" = "Établisseent",
  "Dirigeants" = "Dirigeants",
  "Immeubles" = "Immeubles",
  "Siège" = "Siège",
}


export class RnaEventModificationDetail {
  type: eRnaModificationType;
  valueBefore?: string;
  observation?: string;
}

export interface IRnaEventOutput {
  id: string;
  type: eRnaEventType;
  createdAt: Date;
  joPublishedAt: Date | null
  dissolutionType: eRnaDissolutionType
  modificationDetails?: RnaEventModificationDetail[];
}
