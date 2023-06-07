import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { isNumber } from "class-validator";
import { computeLuhn, padZero } from "@/shared/utils/number.utils";

const LUHN_ALGORITHM_KEY = 42;
const LUHN_ALGORITHM_KEY_SIZE = LUHN_ALGORITHM_KEY.toString().length;

type MinimalFoundationInformation = Pick<FoundationEntity, "id" | "department" | "type">;

export const createRnfId = (foundation: MinimalFoundationInformation): string => {
  return addLuhnToRnf(createRnfWithoutLuhn(foundation));
};

export const isRnfLuhnValid = (rnf: string): boolean => {
  const rnfWithoutLuhn = rnf.slice(0, -LUHN_ALGORITHM_KEY_SIZE - 1);
  return rnf === addLuhnToRnf(rnfWithoutLuhn);
};

const checkFoundationInformation = (foundation: MinimalFoundationInformation): void => {
  switch (true) {
    // @ts-expect-error this function is too important to rely only on typescript
    case !foundation:
      throw new Error("Foundation is not defined");
    case !isNumber(foundation.id):
      throw new Error("Foundation id is not a number");
    case !isNumber(foundation.department):
      throw new Error("Foundation department is not a number");
    // @ts-expect-error same as above
    case !foundation.type:
      throw new Error("Foundation type is not defined");
    default:
      return;
  }
};

const createRnfWithoutLuhn = (foundation: MinimalFoundationInformation): string => {
  checkFoundationInformation(foundation);
  return `${padZero(foundation.department, 3)}-${foundation.type}-${padZero(foundation.id, 6)}`;
};

const addLuhnToRnf = (rnfWithoutLuhn: string): string => {
  const noDash = rnfWithoutLuhn.replace(/-/g, "");
  let onlyNumbersString = "";
  for (let i = 0; i < noDash.length; i++) {
    onlyNumbersString += noDash.charCodeAt(i).toString();
  }
  const luhn = computeLuhn(onlyNumbersString);
  return `${rnfWithoutLuhn}-${padZero(luhn, LUHN_ALGORITHM_KEY_SIZE)}`;
};
