export function createEnum<T extends ReadonlyArray<string>>(list: T) {
  return Object.fromEntries(list.map(key => [key, key])) as {
    [K in T[number]]: K
  }
}
