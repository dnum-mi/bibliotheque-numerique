import { LOCALE_FOR_DATE_TIME } from '@/config'

export const dateTimeToStringFr = (value: string | number): string => {
  return value
    ? new Intl.DateTimeFormat(LOCALE_FOR_DATE_TIME, { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value))
    : ''
}

export const dateToStringFr = (value: Date | string | number | undefined | null): string => {
  return value
    ? new Intl.DateTimeFormat(LOCALE_FOR_DATE_TIME).format(new Date(value))
    : ''
}

export const getDateFormatter = (
  locale: string = LOCALE_FOR_DATE_TIME,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'medium' },
) => (date: Date) => new Intl.DateTimeFormat(locale, options).format(date)

export const formatForMessageDate = getDateFormatter()
