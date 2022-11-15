import { LANG_FOR_DATE_TIME } from '@/config'

export const dateTimeToStringFr = (value:string|number):string => {
  return value
    ? (new Date(value)).toLocaleString(LANG_FOR_DATE_TIME)
    : ''
}

export const dateToStringFr = (value:string|number):string => {
  return value
    ? (new Date(value)).toLocaleDateString(LANG_FOR_DATE_TIME)
    : ''
}
