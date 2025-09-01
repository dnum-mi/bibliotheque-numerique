import { deepAlmostEqual, selectKeysInObject } from './object'

describe('deepAlmostEqual', () => {
  it('returns true for two empty objects', () => {
    expect(deepAlmostEqual({}, {})).toBe(true)
  })

  it('returns true for two objects with the same properties and values', () => {
    const obj1 = { a: 1, b: 'hello', c: { d: true } }
    const obj2 = { a: 1, b: 'hello', c: { d: true } }
    expect(deepAlmostEqual(obj1, obj2)).toBe(true)
  })

  it('returns false for two objects with different properties', () => {
    const obj1 = { a: 1, b: 'hello' }
    const obj2 = { a: 1, c: 'world' }
    expect(deepAlmostEqual(obj1, obj2)).toBe(false)
  })

  it('returns false for two objects with different values', () => {
    const obj1 = { a: 1, b: 'hello' }
    const obj2 = { a: 1, b: 'world' }
    expect(deepAlmostEqual(obj1, obj2)).toBe(false)
  })

  it('returns true for two objects with null and undefined values', () => {
    const obj1 = { a: null, b: undefined }
    const obj2 = { a: undefined, b: null }
    expect(deepAlmostEqual(obj1, obj2)).toBe(true)
  })
})

describe('selectKeysInObject', () => {
  it('returns an empty object when given an empty object', () => {
    expect(selectKeysInObject({}, [])).toEqual({})
  })

  it('returns an object with only the selected keys', () => {
    const obj = { a: 1, b: 'hello', c: true }
    expect(selectKeysInObject(obj, ['a', 'c'])).toEqual({ a: 1, c: true })
  })

  it('ignores keys that are not present in the object', () => {
    const obj = { a: 1, b: 'hello', c: true }
    expect(selectKeysInObject(obj, ['a', 'd'])).toEqual({ a: 1 })
  })

  it('returns an empty object when given an empty array of keys', () => {
    const obj = { a: 1, b: 'hello', c: true }
    expect(selectKeysInObject(obj, [])).toEqual({})
  })
})
