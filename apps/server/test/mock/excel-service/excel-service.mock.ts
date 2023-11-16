const fakeExcelDateFunding = 45288 // Date to string: '28/12/2023'
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
