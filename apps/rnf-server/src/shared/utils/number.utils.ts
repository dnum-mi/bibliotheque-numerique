import { isNumber } from "class-validator";

export const padZero = (num: number, places: number): string => {
  if (places < 0) {
    throw new Error("Zero pad places must be greater than 0");
  }
  return String(num).padStart(places, "0");
};

export const computeLuhn = (source: string, mod = 10): number => {
  let total = 0;
  let alternate = false;
  if (!isNumber(Number(source))) {
    throw new Error("Source is not a valid number");
  }
  for (let i = source.length - 1; i >= 0; i--) {
    let n = Number(source[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    total += n;
    alternate = !alternate;
  }
  return mod - (total % mod);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.match(/^\+?\d{11}$/)) {
    return phoneNumber;
  }
  const normalizedPhoneNumber: string = phoneNumber
    .replace(/\D/g, "")
    .replace(/^00(.*)$/, "+$1")
    .replace(/^0(.*)$/, "+33$1");
  if (normalizedPhoneNumber.length !== 12) {
    throw new Error("This phone number is not valid: " + phoneNumber);
  }
  return normalizedPhoneNumber;
};
