import prettyBytes from 'pretty-bytes'

export const prettyByteSizeByString = (value: string): string => {
  return value
    ? prettyBytes(Number(value))
    : ''
}
