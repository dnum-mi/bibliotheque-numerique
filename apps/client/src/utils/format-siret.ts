export function formatSiret (raw: string | null): string {
  if (!raw) {
    return ''
  }

  const digits = raw.replace(/\D/g, '')

  if (digits.length !== 14) {
    return raw
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
}
