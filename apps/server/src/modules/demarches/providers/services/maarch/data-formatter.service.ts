import { MaarchEtatType } from '@/modules/demarches/objects/constants/maarch-champ.enum'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Prefecture, PrefectureDictionary, PrefectureKey } from '@biblio-num/shared'
import { DossierState } from '@dnum-mi/ds-api-client'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DataFormatterService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  formatPhoneNumber(phoneString: string): string | null {
    if (!phoneString) return null

    let digits = phoneString.replace(/\D/g, '')

    if (digits.startsWith('33') && digits.length === 11) {
      digits = '0' + digits.substring(2)
    }

    if (digits.length === 9 && /^[1-9]/.test(digits)) {
      digits = '0' + digits
    }

    if (digits.startsWith('0') && digits.length === 10) {
      return digits.replace(
        /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
        '$1 $2 $3 $4 $5',
      )
    }

    this.logger.warn(`Non-standard phone number ignored: "${phoneString}"`)
    return phoneString
  }

  parseBoolean(value: string): boolean | null {
    if (!value) return null

    const lowerValue = value.toLowerCase().trim()

    const booleanMap: { [key: string]: boolean } = {
      oui: true,
      yes: true,
      true: true,
      1: true,
      non: false,
      no: false,
      false: false,
      0: false,
    }

    return booleanMap[lowerValue] ?? null
  }

  parseDate(dateString: string): Date | null {
    if (!dateString) return null

    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date
    }

    const frenchFormat = /^(\d{2})\/(\d{2})\/(\d{4})/
    const match = dateString.match(frenchFormat)

    if (match) {
      const [, dayStr, monthStr, yearStr] = match
      const day = parseInt(dayStr)
      const month = parseInt(monthStr)
      const year = parseInt(yearStr)

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        this.logger.warn(`Invalid day or month in date: "${dateString}"`)
        return null
      }
      const parsedDate = new Date(year, month - 1, day)

      if (!isNaN(parsedDate.getTime()) && parsedDate.getMonth() === month - 1) {
        return parsedDate
      }
    }

    this.logger.warn(`Unrecognized date format: "${dateString}"`)
    return null
  }

  getPrefectureKey(prefectureName: string): PrefectureKey | null {
    if (!prefectureName) return null

    const key = this._findByDepartmentCode(prefectureName)
    if (key) return key

    return this._findByName(prefectureName)
  }

  getStatus(status: string): DossierState | null {
    if (!status) return null

    const normalizedStatus = status.trim()

    const statusMap: Record<MaarchEtatType, DossierState> = {
      VAL: DossierState.Accepte,
      REJ: DossierState.Refuse,
      SSUITE: DossierState.SansSuite,
    }

    return statusMap[normalizedStatus] ?? null
  }

  private _findByDepartmentCode(input: string): PrefectureKey | null {
    const codeMatch = input.match(/^(D?\d{2,3}|D?2A|D?2B)/i)

    if (!codeMatch) return null

    let potentialKey = codeMatch[0].toUpperCase()

    if (!potentialKey.startsWith('D')) {
      potentialKey = `D${potentialKey}`
    }

    return Prefecture[potentialKey] ? (potentialKey as PrefectureKey) : null
  }

  private _findByName(input: string): PrefectureKey | null {
    const normalizedInput = this._normalizeString(input)

    for (const [key, value] of Object.entries(PrefectureDictionary)) {
      const dictName = value.split(' - ')[1] || ''
      const normalizedDictName = this._normalizeString(dictName)

      if (normalizedInput === normalizedDictName) {
        return key as PrefectureKey
      }
    }

    this.logger.warn(`No prefecture key found for: "${input}"`)
    return null
  }

  private _normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^(la|le|l')/, '')
      .replace(/[\s\-'']/g, '')
  }
}
