export function buildRecord<K extends string | number | symbol, V>(
  groups: [K[], V][]
): Record<K, V> {
  return groups.reduce((acc, [keys, value]) => {
    keys.forEach((key) => (acc[key] = value))
    return acc
  }, {} as Record<K, V>)
}
