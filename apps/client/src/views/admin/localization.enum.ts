export const LocalizationOptions = {
  national: 'national',
  prefectures: 'prefectures',
}

export type LocalizationOptionsKeys = (typeof LocalizationOptions)[keyof typeof LocalizationOptions]
