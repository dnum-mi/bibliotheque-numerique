import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { isNumber } from 'class-validator'
import { computeLuhn, padZero } from '@/shared/utils/number.utils'
import { throwIf } from '@/shared/utils/error.utils'

const LUHN_ALGORITHM_KEY = 42
const LUHN_ALGORITHM_KEY_SIZE = LUHN_ALGORITHM_KEY.toString().length
type MinimalFoundationInformation = Pick<FoundationEntity, 'department' | 'type'>;
export interface FountationInformationToCreateRnf {
  foundation: MinimalFoundationInformation;
  index: number;
}

const hasNoFoundation = (dto: FountationInformationToCreateRnf) =>
  (dto.foundation ? null : 'Foundation is not defined')
const indexIsNotANumber = (dto: FountationInformationToCreateRnf) =>
  (isNumber(dto.index) ? null : 'Foundation index is not a number')
const departmentIsNotCorrect = (dto: FountationInformationToCreateRnf) =>
  !dto.foundation.department || dto.foundation.department.length > 3
    ? 'Foundation department is not a three characters string'
    : null
const hasNoType = (dto: FountationInformationToCreateRnf) => (dto.foundation.type
  ? null
  : 'Foundation type is not defined')
const checkFoundation = throwIf<FountationInformationToCreateRnf>(
  hasNoFoundation, indexIsNotANumber, departmentIsNotCorrect, hasNoType,
)

const createRnfWithoutLuhn = (dto: FountationInformationToCreateRnf): string => {
  checkFoundation(dto)
  const department = (dto.foundation.department.length === 2 ? '0' : '') + dto.foundation.department.toUpperCase()
  return `${department}-${dto.foundation.type}-${padZero(dto.index, 5)}`
}

const addLuhnToRnf = (rnfWithoutLuhn: string): string => {
  const noDash = rnfWithoutLuhn.replace(/-/g, '')
  let onlyNumbersString = ''
  for (let i = 0; i < noDash.length; i++) {
    onlyNumbersString += noDash.charCodeAt(i).toString()
  }
  const luhn = computeLuhn(onlyNumbersString)
  return `${rnfWithoutLuhn}-${padZero(luhn, LUHN_ALGORITHM_KEY_SIZE)}`
}

export const createRnfId = (dto: FountationInformationToCreateRnf): string => {
  return addLuhnToRnf(createRnfWithoutLuhn(dto))
}

export const isRnfLuhnValid = (rnf: string): boolean => {
  const rnfWithoutLuhn = rnf.slice(0, -LUHN_ALGORITHM_KEY_SIZE - 1)
  return rnf === addLuhnToRnf(rnfWithoutLuhn)
}
