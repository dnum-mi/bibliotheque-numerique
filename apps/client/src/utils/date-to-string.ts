import { LOCALE_FOR_DATE_TIME } from '@/config'

export const dateTimeToStringFr = (value: string | number): string => {
  return value ? new Intl.DateTimeFormat(LOCALE_FOR_DATE_TIME, { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)) : ''
}

export const dateToStringFr = (value: Date | string | number | undefined | null): string => {
  return value ? new Intl.DateTimeFormat(LOCALE_FOR_DATE_TIME).format(new Date(value)) : ''
}

export const dateTimeToFormatedStringFr = (value: string | number): string => {
  if (!value) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat(LOCALE_FOR_DATE_TIME, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date(value))
  const partMap = Object.fromEntries(parts.map(({ type, value }) => [type, value]))

  return `${partMap.day} ${partMap.month} ${partMap.year} ${partMap.hour}:${partMap.minute}`
}

export const getDateFormatter
  = (locale: string = LOCALE_FOR_DATE_TIME, options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'medium' }) =>
    (date: Date) => {
      return new Intl.DateTimeFormat(locale, options).format(date)
    }

export const formatForMessageDate = getDateFormatter()
