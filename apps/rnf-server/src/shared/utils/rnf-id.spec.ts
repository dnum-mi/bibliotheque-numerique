import { createRnfId, isRnfLuhnValid } from "@/shared/utils/rnf-id.utils";
import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { FoundationType } from "@prisma/client";

describe("Utils: RNF ID", () => {
  it("should throw if it is impossible to create rnf", () => {
    expect(() => {
      createRnfId(undefined as unknown as FoundationEntity);
    }).toThrow("Foundation is not defined");

    expect(() => {
      createRnfId({
        type: FoundationType.FDD,
        department: 42,
      } as FoundationEntity);
    }).toThrow("Foundation id is not a number");

    expect(() => {
      createRnfId({
        id: "fakeId",
        type: FoundationType.FDD,
        department: 42,
      } as unknown as FoundationEntity);
    }).toThrow("Foundation id is not a number");

    expect(() => {
      createRnfId({
        id: 42,
        department: 42,
      } as FoundationEntity);
    }).toThrow("Foundation type is not defined");

    expect(() => {
      createRnfId({
        id: 42,
        type: FoundationType.FRUP,
      } as FoundationEntity);
    }).toThrow("Foundation department is not a number");
  });

  it("should create rnf", () => {
    expect(
      createRnfId({
        id: 42,
        type: FoundationType.FRUP,
        department: 42,
      } as FoundationEntity),
    ).toEqual("042-FRUP-000042-09");

    expect(
      createRnfId({
        id: 1234,
        type: FoundationType.FRUP,
        department: 978,
      } as FoundationEntity),
    ).toEqual("978-FRUP-001234-01");

    expect(
      createRnfId({
        id: 42,
        type: FoundationType.FRUP,
        department: 57,
      } as FoundationEntity),
    ).toEqual("057-FRUP-000042-03");
  });

  it("should verify luhn", () => {
    expect(isRnfLuhnValid("042-FRUP-000042-09")).toBeTruthy();
    expect(isRnfLuhnValid("042-FRUP-000042-42")).toBeFalsy();
    expect(isRnfLuhnValid("978-FRUP-001234-01")).toBeTruthy();
    expect(isRnfLuhnValid("978-FRUP-001234-11")).toBeFalsy();
  });
});
