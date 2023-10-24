const fakeExcelDateFunding = '11/11/2022'
const fakeExcelContributorPersonalityType = 'PM'
const fakeExcelNativeContry = 'AUTRICHE'
const fakeExcelNatureFunding = 'RP'
const fakeExcelCharacterFunding = 'D'
const fakeExcelPaymentMethod = 'CB'
const fakeExcelAmount = 1000

const fakeExcelData = [
  [
    fakeExcelDateFunding,
    fakeExcelContributorPersonalityType,
    fakeExcelNativeContry,
    fakeExcelNatureFunding,
    fakeExcelCharacterFunding,
    fakeExcelPaymentMethod,
    fakeExcelAmount,
  ],
  [
    fakeExcelDateFunding,
    fakeExcelContributorPersonalityType,
    fakeExcelNativeContry,
    fakeExcelNatureFunding,
    fakeExcelCharacterFunding,
    fakeExcelPaymentMethod,
    fakeExcelAmount,
  ],
]

export const excelServiceMock = {
  readExcelFileFromS3: jest
    .fn()
    .mockResolvedValue(fakeExcelData),
}
