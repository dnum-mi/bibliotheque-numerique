import {
  FileTagKey,
  TypeFileKey,
  dFileTabDictionary,
  eFileTag,
  typeFileArray,
} from '@biblio-num/shared'

const displayNameToTagMap: Partial<Record<TypeFileKey, FileTagKey>> = {}
for (const tag in dFileTabDictionary) {
  displayNameToTagMap[dFileTabDictionary[tag as FileTagKey]] = tag as FileTagKey
}

const getTagForType = (
  typeFile: TypeFileKey | undefined | null,
): FileTagKey => {
  if (!typeFile) {
    return eFileTag.other
  }
  const originalMap = new Map<TypeFileKey, FileTagKey>(
    Object.entries(displayNameToTagMap) as [TypeFileKey, FileTagKey][],
  )
  return originalMap.get(typeFile) || eFileTag.other
}

describe('TypeFile to Tag', () => {

  typeFileArray.forEach((typeFile) => {
    const expectedTag = displayNameToTagMap[typeFile] || eFileTag.other

    it(`should process "${typeFile}" and return the tag "${expectedTag}"`, () => {
      const result = getTagForType(typeFile)
      expect(result).toBe(expectedTag)
    })
  })

  it("should return the 'other' tag for a file type that is not listed", () => {
    const unknownType: TypeFileKey = 'Règlement intérieur'
    const result = getTagForType(unknownType)
    expect(result).toBe(eFileTag.other)
  })

  it("should return the tag 'other' for a random string", () => {
    const randomString = 'un document totalement inconnu' as TypeFileKey
    const result = getTagForType(randomString)
    expect(result).toBe(eFileTag.other)
  })

  it("should return the tag 'other' for a entry 'null'", () => {
    const result = getTagForType(null)
    expect(result).toBe(eFileTag.other)
  })

  it("should return the tag 'other' for an entry 'undefined'", () => {
    const result = getTagForType(undefined)
    expect(result).toBe(eFileTag.other)
  })
})
