import { createRnfId, FountationInformationToCreateRnf, isRnfLuhnValid } from '@/shared/utils/rnf-id.utils'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { FoundationType } from '@prisma/client'

describe('Utils: RNF ID', () => {
  it('should throw if it is impossible to create rnf', () => {
    expect(() => {
      createRnfId({ foundation: undefined } as unknown as FountationInformationToCreateRnf)
    }).toThrow('Foundation is not defined')

    expect(() => {
      createRnfId({
        foundation: {
          type: FoundationType.FDD,
          department: '42',
        } as FoundationEntity,
        index: null as unknown as number,
      })
    }).toThrow('Foundation index is not a number')

    expect(() => {
      createRnfId({
        foundation: {
          type: FoundationType.FDD,
          department: '42',
        } as unknown as FoundationEntity,
        index: 'wrong' as unknown as number,
      })
    }).toThrow('Foundation index is not a number')

    expect(() => {
      createRnfId({
        foundation: {
          id: 42,
          department: '42',
        } as FoundationEntity,
        index: 0,
      })
    }).toThrow('Foundation type is not defined')

    expect(() => {
      createRnfId({
        foundation: {
          id: 42,
          type: FoundationType.FRUP,
        } as FoundationEntity,
        index: 0,
      })
    }).toThrow('Foundation department is not a three characters string')
  })

  it('should create rnf', () => {
    expect(
      createRnfId({
        foundation: {
          type: FoundationType.FRUP,
          department: '42',
        } as FoundationEntity,
        index: 42,
      }),
    ).toEqual('042-FRUP-00042-05')

    expect(
      createRnfId({
        foundation: {
          type: FoundationType.FRUP,
          department: '978',
        } as FoundationEntity,
        index: 1234,
      }),
    ).toEqual('978-FRUP-01234-07')

    expect(
      createRnfId({
        foundation: {
          type: FoundationType.FRUP,
          department: '57',
        } as FoundationEntity,
        index: 42,
      }),
    ).toEqual('057-FRUP-00042-09')
  })

  it('should verify luhn', () => {
    expect(isRnfLuhnValid('042-FRUP-00042-05')).toBeTruthy()
    expect(isRnfLuhnValid('042-FRUP-00042-42')).toBeFalsy()
    expect(isRnfLuhnValid('978-FRUP-01234-07')).toBeTruthy()
    expect(isRnfLuhnValid('978-FRUP-01234-11')).toBeFalsy()
  })
})
