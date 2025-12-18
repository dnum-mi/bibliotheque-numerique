import { FilterMatchMode } from '@primevue/core'

const BASE_LABELS = {
  startsWith: 'Commence par',
  contains: 'Contient',
  notContains: 'Ne contient pas',
  endsWith: 'Se termine par',
  equals: 'Égal à',
  notEquals: 'Différent de',
  blank: 'Vide',
  notBlank: 'Non vide',
  greaterThan: 'Supérieur à',
  greaterThanOrEqual: 'Supérieur ou égal à',
  lessThan: 'Inférieur à',
  lessThanOrEqual: 'Inférieur ou égal à',
  dateBefore: 'Avant',
  dateAfter: 'Après',
  dateIs: 'Est le',
  dateIsNot: 'N’est pas le',
  clear: 'Effacer',
  apply: 'Appliquer',
  addRule: 'Ajouter une règle',
  removeRule: 'Supprimer la règle',
  matchAll: 'Satisfaire tous',
  matchAny: 'Satisfaire au moins un',
}

export const PRIMEVUE_FR_LOCALE = {
  ...BASE_LABELS,
  firstDayOfWeek: 1,
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  today: 'Aujourd\'hui',
  weekHeader: 'Sem',
  fileSizeTypes: ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'],
}

export const PRIMEVUE_MATCH_MODE_OPTIONS = {
  text: ['startsWith', 'contains', 'notContains', 'endsWith', 'equals', 'notEquals', 'blank', 'notBlank'],
  numeric: ['equals', 'notEquals', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual'],
  date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'],
}

export const ACTIVE_FILTERS_DISPLAY_LABELS: Record<string, string | string> = {
  ...BASE_LABELS,

  [FilterMatchMode.CONTAINS]: BASE_LABELS.contains,
  [FilterMatchMode.NOT_CONTAINS]: BASE_LABELS.notContains,
  [FilterMatchMode.EQUALS]: BASE_LABELS.equals,
  [FilterMatchMode.NOT_EQUALS]: BASE_LABELS.notEquals,
  [FilterMatchMode.STARTS_WITH]: BASE_LABELS.startsWith,
  [FilterMatchMode.ENDS_WITH]: BASE_LABELS.endsWith,

  [FilterMatchMode.LESS_THAN]: BASE_LABELS.lessThan,
  [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: BASE_LABELS.lessThanOrEqual,
  [FilterMatchMode.GREATER_THAN]: BASE_LABELS.greaterThan,
  [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: BASE_LABELS.greaterThanOrEqual,

  [FilterMatchMode.DATE_IS]: BASE_LABELS.dateIs,
  [FilterMatchMode.DATE_IS_NOT]: BASE_LABELS.dateIsNot,
  [FilterMatchMode.DATE_BEFORE]: BASE_LABELS.dateBefore,
  [FilterMatchMode.DATE_AFTER]: BASE_LABELS.dateAfter,

  gt: BASE_LABELS.greaterThan,
  gte: BASE_LABELS.greaterThanOrEqual,
  lt: BASE_LABELS.lessThan,
  lte: BASE_LABELS.lessThanOrEqual,
  inRange: 'Entre',
  set: 'Est parmi',
  boolean: 'Est',
}
