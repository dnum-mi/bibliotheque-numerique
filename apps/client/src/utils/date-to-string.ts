import { LOCALE_FOR_DATE_TIME } from '@/config'

export const dateTimeToStringFr = (value: string | number): string => {
  return value
    ? (new Date(value)).toLocaleString(LOCALE_FOR_DATE_TIME)
    : ''
}

export const dateToStringFr = (value: Date | string | number | undefined): string => {
  return value
    ? (new Date(value)).toLocaleDateString(LOCALE_FOR_DATE_TIME)
    : ''
}
