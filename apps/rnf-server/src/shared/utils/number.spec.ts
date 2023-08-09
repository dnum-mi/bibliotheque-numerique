import { computeLuhn, formatPhoneNumber, padZero } from '@/shared/utils/number.utils'

describe('Utils: Numbers', () => {
  it('should zero pad correctly', () => {
    expect(padZero(1, 2)).toEqual('01')
    expect(padZero(1, 3)).toEqual('001')
    expect(padZero(1, 4)).toEqual('0001')
    expect(padZero(145, 5)).toEqual('00145')
    expect(padZero(145, 2)).toEqual('145')
    expect(() => {
      padZero(145, -1)
    }).toThrow('Zero pad places must be greater than 0')
  })

  it('Should give the luhn key correctly', () => {
    expect(computeLuhn('1', 10)).toEqual(9)
    expect(computeLuhn('2')).toEqual(8)
    expect(computeLuhn('37', 10)).toEqual(7)
    expect(computeLuhn('123456789', 10)).toEqual(3)
    expect(computeLuhn('123456789', 42)).toEqual(37)
    expect(computeLuhn('98273465', 42)).toEqual(38)
    expect(() => {
      computeLuhn('fakeNumber', 10)
    }).toThrow('Source is not a valid number')
  })

  it('Should convert number phone correctly', () => {
    expect(formatPhoneNumber('0601020304')).toEqual('+33601020304')
    expect(formatPhoneNumber('+33601020304')).toEqual('+33601020304')
    expect(formatPhoneNumber('06 01 02 03 04')).toEqual('+33601020304')
    expect(formatPhoneNumber('06.01.02.03.04')).toEqual('+33601020304')
    expect(formatPhoneNumber('06-01-02-03-04')).toEqual('+33601020304')
    expect(formatPhoneNumber('00336 01 02 03 04')).toEqual('+33601020304')
    expect(formatPhoneNumber('00 336 01 02 03 04')).toEqual('+33601020304')
    expect(formatPhoneNumber('00 33 6 01 02 03 04')).toEqual('+33601020304')
    expect(() => {
      formatPhoneNumber('toto')
    }).toThrowError('This phone number is not valid')
  })
})
