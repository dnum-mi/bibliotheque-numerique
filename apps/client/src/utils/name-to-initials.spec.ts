import { getInitialsFromName } from './name-to-initials'

describe('nameToInitials', () => {
  it('should return empty string if name is empty', () => {
    expect(getInitialsFromName('')).toEqual('')
  })

  it('should return the first letter of each word in uppercase', () => {
    expect(getInitialsFromName('John Doe')).toEqual('JD')
    expect(getInitialsFromName('jane smith')).toEqual('JS')
    expect(getInitialsFromName('jane   smith')).toEqual('JS')
    expect(getInitialsFromName('  Jane   Smith  ')).toEqual('JS')
  })

  it('should return only the first letter if name is a single word', () => {
    expect(getInitialsFromName('John')).toEqual('J')
    expect(getInitialsFromName('jane')).toEqual('J')
  })
})
