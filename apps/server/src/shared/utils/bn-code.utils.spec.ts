import {
  fromStringToBnChampCode,
  doesTextContainBnCode,
} from './bn-code.utils'

describe('Bn code utils', () => {
  describe('fromStringToBnChampCode', () => {
    it('should convert valid-key to a BN code', () => {
      const key = 'valid-key'
      const expectedBnCode = '#bncode-valid-key-bncode#'
      expect(fromStringToBnChampCode(key)).toBe(expectedBnCode)
    })

    it('should convert validKey to a BN code', () => {
      const key = 'validKey'
      const expectedBnCode = '#bncode-validKey-bncode#'
      expect(fromStringToBnChampCode(key)).toBe(expectedBnCode)
    })

    it('should throw an error for an numeric key', () => {
      const key = '123'
      expect(() => {
        fromStringToBnChampCode(key)
      }).toThrowError(
        'The key is not valid to be converted to a BN code',
      )
    })

    it('should throw an error for an empty key', () => {
      const key = ''
      expect(() => {
        fromStringToBnChampCode(key)
      }).toThrowError(
        'The key is not valid to be converted to a BN code',
      )
    })
  })

  describe('doesTextContainBnCode', () => {
    it('should return the BN code if present in the text', () => {
      const text = 'Here is a BN code: #bncode-validKey-bncode# in the text.'
      const expectedBnCodePart = 'validKey'
      expect(doesTextContainBnCode(text)).toBe(expectedBnCodePart)
    })

    it('should return the BN code if present in the text', () => {
      const text = 'Here is a BN code: #bncode-valid-key-bncode# in the text.'
      const expectedBnCodePart = 'valid-key'
      expect(doesTextContainBnCode(text)).toBe(expectedBnCodePart)
    })

    it('should return null if the text does not contain a BN code', () => {
      const text = 'This text does not have a BN code.'
      expect(doesTextContainBnCode(text)).toBeNull()
    })

    it('should detect BN code regardless of the surrounding content', () => {
      const textWithPrecedingContent =
        'Preceding content #bncode-valid-key-bncode# following content.'
      const expectedBnCodePart = 'valid-key'
      expect(doesTextContainBnCode(textWithPrecedingContent)).toBe(
        expectedBnCodePart,
      )
    })

    it('should detect BN code regardless of special char', () => {
      const textWithSpecialChars = '!@# #bncode-valid-key-bncode# $%^'
      const expectedBnCodePart = 'valid-key'
      expect(doesTextContainBnCode(textWithSpecialChars)).toBe(
        expectedBnCodePart,
      )
    })
  })
})
