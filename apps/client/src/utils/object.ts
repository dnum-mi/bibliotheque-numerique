/* eslint curly: 'off', 'antfu/if-newline': 'off' */

// return true if two object are deeply similar
// will consider undefined and null as equal
export const deepAlmostEqual = (obj1: unknown, obj2: unknown) => {
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
  // Si la clé n’existe pas dans l’un des deux objets, on continue quand même
  // car si la valeur est undefined dans l’autre, on considère que c’est ok
  // if (keys1.length !== keys2.length) return false
  for (const key of keys1) {
    if (!keys2.includes(key) && toRaw(obj1[key]) !== undefined) {
      return false
    }
    // @ts-expect-error Use dynamic key of unknown object
    if (!deepAlmostEqual(toRaw(obj1[key]), toRaw(obj2[key]))) {
      return false
    }
  }
  // Vérifier les clés qui existent dans obj2 mais pas dans obj1
  for (const key of keys2) {
    if (!keys1.includes(key) && toRaw((obj2 as any)[key]) !== undefined) {
      return false
    }
  }
  return true
}

const pick = <T extends Record<string | symbol, unknown>>(obj: T | undefined | null, keys: (string | symbol)[]): Partial<T> =>
  obj ? (Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key))) as Partial<T>) : {}

export const selectKeysInObject = pick
