export function groupBy<T>(arr: T[], fn: (item: T) => string) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr)
    const group = prev[groupKey] || []
    group.push(curr)
    return { ...prev, [groupKey]: group }
  }, {})
}

export function distinct<T>(array: T[], key: string): T[] {
  return array.filter((obj, index, arr) => {
    return array.map((mapObj) => mapObj[key]).indexOf(obj[key]) === index
  })
}

export function replaceElement<T>(array: T[], element: T, idKey: string): T[] {
  const indexOf = array.findIndex((x) => x['idKey'] === element['idKey'])
  if (indexOf > -1) {
    array[indexOf] = element
  }
  return array
}
