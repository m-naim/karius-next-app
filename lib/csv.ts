function detectDelimiter(headerLine: string): string {
  const candidates = [',', ';', '\t']
  return candidates.reduce((best, candidate) => {
    const bestCount = headerLine.split(best).length
    const candidateCount = headerLine.split(candidate).length
    return candidateCount > bestCount ? candidate : best
  }, ',')
}

function parseCsvRows(input: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const nextChar = input[index + 1]

    if (char === '"') {
      if (quoted && nextChar === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (!quoted && char === delimiter) {
      row.push(value)
      value = ''
      continue
    }

    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(value)
      value = ''
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      continue
    }

    value += char
  }

  row.push(value)
  if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  return rows
}

export function csvToArray(input: string, delimiter?: string): Record<string, string>[] {
  if (!input || typeof input !== 'string') return []

  const normalizedInput = input.replace(/^\uFEFF/, '')
  const firstLine = normalizedInput.split(/\r?\n/, 1)[0] || ''
  const actualDelimiter = delimiter || detectDelimiter(firstLine)
  const rows = parseCsvRows(normalizedInput, actualDelimiter)
  const headers = rows.shift()?.map((header) => header.trim()) || []

  return rows.map((cells) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      if (header) record[header] = (cells[index] || '').trim()
      return record
    }, {})
  )
}
