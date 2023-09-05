// return true if two object are deeply similar
// will consider undefined and null as equal
export const deepAlmostEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true
  // eslint-disable-next-line eqeqeq
  if ((obj1 === null || obj2 === null) && (obj1 == obj2)) {
    return true
  }
  if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false
  }
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepAlmostEqual(obj1[key], obj2[key])) return false
  }
  return true
}

export const selectKeysInObject = (a: any, keys: string[]) => {
  const result: any = {}
  if (!a || typeof a !== 'object') {
    return a
  }
  Object.keys(a).forEach(key => {
    if (keys.includes(key)) {
      result[key] = a[key]
    }
  })
  return result
}

// export const pick = (obj: Record<string | symbol, any>, keys: (string | symbol)[]) => ({

// })
