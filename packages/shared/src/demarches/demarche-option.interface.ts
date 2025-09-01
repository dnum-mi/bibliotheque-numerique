import { anonymisationEventKey } from "./anonymisation-event-list.enum";

export interface IDemarcheOption {
  nbrMonthAnonymisation: number | null;
  anonymizationEvent: anonymisationEventKey | null,
  isOnAllDossiersOfOrganisme: boolean,
}
