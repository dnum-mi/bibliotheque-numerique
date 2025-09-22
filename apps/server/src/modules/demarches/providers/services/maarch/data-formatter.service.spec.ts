import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DataFormatterService } from './data-formatter.service'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { Test, TestingModule } from '@nestjs/testing'

describe('DataFormatterService', () => {
  let service: DataFormatterService
  let logger: LoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataFormatterService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile()

    service = module.get<DataFormatterService>(DataFormatterService)
    logger = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('formatPhoneNumber', () => {
    it('should format valid French phone numbers', () => {
      expect(service.formatPhoneNumber('0612345678')).toBe('06 12 34 56 78')
      expect(service.formatPhoneNumber('0123456789')).toBe('01 23 45 67 89')
      expect(service.formatPhoneNumber('06.12.34.56.78')).toBe('06 12 34 56 78')
      expect(service.formatPhoneNumber('06-12-34-56-78')).toBe('06 12 34 56 78')
    })

    it('should handle international format', () => {
      expect(service.formatPhoneNumber('33612345678')).toBe('06 12 34 56 78')
      expect(service.formatPhoneNumber('+33612345678')).toBe('06 12 34 56 78')
    })

    it('should add leading zero if missing', () => {
      expect(service.formatPhoneNumber('612345678')).toBe('06 12 34 56 78')
      expect(service.formatPhoneNumber('123456789')).toBe('01 23 45 67 89')
    })

    it('should return null for empty input', () => {
      expect(service.formatPhoneNumber('')).toBeNull()
      expect(service.formatPhoneNumber(null as any)).toBeNull()
      expect(service.formatPhoneNumber(undefined as any)).toBeNull()
    })

    it('should return original for invalid numbers and log warning', () => {
      const invalidNumber = '12345'
      const result = service.formatPhoneNumber(invalidNumber)

      expect(result).toBe(invalidNumber)
      expect(logger.warn).toHaveBeenCalledWith(
        `Non-standard phone number ignored: "${invalidNumber}"`,
      )
    })

    it('should handle phone numbers with spaces and special characters', () => {
      expect(service.formatPhoneNumber(' 06 12 34 56 78 ')).toBe(
        '06 12 34 56 78',
      )
      expect(service.formatPhoneNumber('(06) 12-34-56-78')).toBe(
        '06 12 34 56 78',
      )
    })
  })

  describe('parseBoolean', () => {
    it('should parse French boolean values', () => {
      expect(service.parseBoolean('oui')).toBe(true)
      expect(service.parseBoolean('Oui')).toBe(true)
      expect(service.parseBoolean('OUI')).toBe(true)
      expect(service.parseBoolean('non')).toBe(false)
      expect(service.parseBoolean('Non')).toBe(false)
      expect(service.parseBoolean('NON')).toBe(false)
    })

    it('should parse English boolean values', () => {
      expect(service.parseBoolean('yes')).toBe(true)
      expect(service.parseBoolean('Yes')).toBe(true)
      expect(service.parseBoolean('no')).toBe(false)
      expect(service.parseBoolean('No')).toBe(false)
    })

    it('should parse standard boolean strings', () => {
      expect(service.parseBoolean('true')).toBe(true)
      expect(service.parseBoolean('false')).toBe(false)
      expect(service.parseBoolean('1')).toBe(true)
      expect(service.parseBoolean('0')).toBe(false)
    })

    it('should return null for invalid or empty values', () => {
      expect(service.parseBoolean('')).toBeNull()
      expect(service.parseBoolean(null as any)).toBeNull()
      expect(service.parseBoolean(undefined as any)).toBeNull()
      expect(service.parseBoolean('maybe')).toBeNull()
      expect(service.parseBoolean('2')).toBeNull()
    })

    it('should handle values with spaces', () => {
      expect(service.parseBoolean(' oui ')).toBe(true)
      expect(service.parseBoolean('  non  ')).toBe(false)
    })
  })

  describe('parseDate', () => {
    it('should parse ISO date strings', () => {
      const isoDate = '2024-01-15T10:30:00.000Z'
      const result = service.parseDate(isoDate)

      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe(isoDate)
    })

    it('should parse French date format DD/MM/YYYY', () => {
      const result = service.parseDate('15/01/2024')

      expect(result).toBeInstanceOf(Date)
      expect(result?.getDate()).toBe(15)
      expect(result?.getMonth()).toBe(0)
      expect(result?.getFullYear()).toBe(2024)
    })

    it('should parse standard date strings', () => {
      const dateString = '2024-01-15'
      const result = service.parseDate(dateString)

      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(0)
      expect(result?.getDate()).toBe(15)
    })

    it('should return null for empty input', () => {
      expect(service.parseDate('')).toBeNull()
      expect(service.parseDate(null as any)).toBeNull()
      expect(service.parseDate(undefined as any)).toBeNull()
    })

    it('should return null and log warning for invalid dates', () => {
      const invalidDate = 'not-a-date'
      const result = service.parseDate(invalidDate)

      expect(result).toBeNull()
      expect(logger.warn).toHaveBeenCalledWith(
        `Unrecognized date format: "${invalidDate}"`,
      )
    })

    it('should handle dates with time in French format', () => {
      const result = service.parseDate('31/12/2024')

      expect(result).toBeInstanceOf(Date)
      expect(result?.getDate()).toBe(31)
      expect(result?.getMonth()).toBe(11)
      expect(result?.getFullYear()).toBe(2024)
    })

    it('should handle invalid French format dates', () => {
      const result = service.parseDate('32/13/2024')
      expect(result).toBeNull()
    })
  })

  describe('getPrefectureKey', () => {
    beforeEach(() => {
      jest.mock('@biblio-num/shared', () => ({
        Prefecture: {
          D01: 'D01',
          D75: 'D75',
          D92: 'D92',
          D2A: 'D2A',
          D2B: 'D2B',
        },
        PrefectureDictionary: {
          D01: '01 - Ain',
          D75: '75 - Paris',
          D92: '92 - Hauts-de-Seine',
          D2A: '2A - Corse-du-Sud',
          D2B: '2B - Haute-Corse',
        },
      }))
    })

    it('should find prefecture by department code', () => {
      expect(service.getPrefectureKey('75')).toBe('D75')
      expect(service.getPrefectureKey('D75')).toBe('D75')
      expect(service.getPrefectureKey('92')).toBe('D92')
      expect(service.getPrefectureKey('D92')).toBe('D92')
    })

    it('should handle Corsica special codes', () => {
      expect(service.getPrefectureKey('2A')).toBe('D2A')
      expect(service.getPrefectureKey('2B')).toBe('D2B')
      expect(service.getPrefectureKey('D2A')).toBe('D2A')
      expect(service.getPrefectureKey('D2B')).toBe('D2B')
    })

    it('should find prefecture by name', () => {
      expect(service.getPrefectureKey('Paris')).toBe('D75')
      expect(service.getPrefectureKey('Hauts-de-Seine')).toBe('D92')
      expect(service.getPrefectureKey("L'Ain")).toBe('D01')
    })

    it('should return null for empty input', () => {
      expect(service.getPrefectureKey('')).toBeNull()
      expect(service.getPrefectureKey(null as any)).toBeNull()
      expect(service.getPrefectureKey(undefined as any)).toBeNull()
    })

    it('should return null and log warning for unknown prefecture', () => {
      const unknown = 'UnknownPrefecture'
      const result = service.getPrefectureKey(unknown)

      expect(result).toBeNull()
      expect(logger.warn).toHaveBeenCalledWith(
        `No prefecture key found for: "${unknown}"`,
      )
    })

    it('should handle case insensitive department codes', () => {
      expect(service.getPrefectureKey('d75')).toBe('D75')
      expect(service.getPrefectureKey('D75')).toBe('D75')
    })
  })
})
