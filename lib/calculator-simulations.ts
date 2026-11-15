import {
  mortgageDefaults,
  mortgageRules,
  mortgageHref,
  numberError,
  parseNumber,
  propertyDefaults,
  propertyErrors,
  propertyRules,
  type MortgageInputs,
  type PropertyInputs,
} from './mortgage-math'

export type SimulationInput =
  | { kind: 'mortgage'; values: MortgageInputs }
  | { kind: 'property'; values: PropertyInputs }
export type SimulationKind = SimulationInput['kind']
export type SavedSimulation = SimulationInput & {
  version: 1
  id: string
  name: string
  customName: boolean
  date: string
}

export const simulationStorageKeys = {
  mortgage: 'mortgage_simulations',
  property: 'property_simulations',
}

const propertyQueryKeys: Record<keyof PropertyInputs, string> = {
  prixBien: 'prix',
  apport: 'apport',
  tauxInteret: 'taux',
  dureeAnnees: 'duree',
  tauxAssurance: 'assurance',
  fraisNotaireTaux: 'notaire',
  taxeFonciere: 'fonciere',
  chargesCopropriete: 'copro',
  entretienAnnuel: 'entretien',
  loyerMensuel: 'loyer',
  inflationLoyer: 'inflation',
  rendementEpargne: 'rendement',
  appreciationImmo: 'hausse',
  dureeDetention: 'horizon',
}

export function cleanSimulationName(value: unknown) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\p{Cc}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
}

export function readSimulationName(query: Record<string, string | string[] | undefined>) {
  return cleanSimulationName(query.nom) || undefined
}

export function validSimulation(input: SimulationInput) {
  if (input.kind === 'property') return Object.keys(propertyErrors(input.values)).length === 0
  return (Object.keys(mortgageRules) as (keyof MortgageInputs)[]).every(
    (key) => !numberError(input.values[key], mortgageRules[key])
  )
}

export function simulationName(input: SimulationInput) {
  const amount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
  const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 })
  if (input.kind === 'property') {
    const years = input.values.dureeDetention
    return cleanSimulationName(
      `Achat ou location · ${amount.format(input.values.prixBien)} · ${years} ${
        years === 1 ? 'an' : 'ans'
      }`
    )
  }
  const years = input.values.dureeAnnees
  return cleanSimulationName(
    `Crédit · ${amount.format(input.values.montantPret)} · ${years} ${
      years === 1 ? 'an' : 'ans'
    } · ${number.format(input.values.tauxInteret)} %`
  )
}

export function simulationHref(input: SimulationInput, customName?: string) {
  if (!validSimulation(input))
    throw new RangeError('La simulation contient des paramètres invalides.')
  const path =
    input.kind === 'mortgage'
      ? mortgageHref(input.values)
      : `/fr/outils/calculateur-immobilier?${new URLSearchParams(
          Object.entries(propertyQueryKeys).map(([key, name]) => [name, String(input.values[key])])
        )}`
  const name = cleanSimulationName(customName)
  return name ? `${path}&${new URLSearchParams({ nom: name })}` : path
}

export function readPropertyQuery(query: Record<string, string | string[] | undefined>) {
  const present = Object.values(propertyQueryKeys).some((key) => query[key] !== undefined)
  if (!present) return { values: propertyDefaults, invalid: false, transferred: false }
  const values = { ...propertyDefaults }
  for (const key of Object.keys(propertyQueryKeys) as (keyof PropertyInputs)[]) {
    const raw = query[propertyQueryKeys[key]]
    const value = typeof raw === 'string' ? parseNumber(raw) : NaN
    if (numberError(value, propertyRules[key])) {
      return { values: propertyDefaults, invalid: true, transferred: false }
    }
    values[key] = value
  }
  if (!validSimulation({ kind: 'property', values })) {
    return { values: propertyDefaults, invalid: true, transferred: false }
  }
  return { values, invalid: false, transferred: true }
}

function storedInput(kind: SimulationKind, raw: unknown): SimulationInput | null {
  if (!raw || typeof raw !== 'object') return null
  const defaults = kind === 'mortgage' ? mortgageDefaults : propertyDefaults
  const values = Object.fromEntries(Object.keys(defaults).map((key) => [key, raw[key]]))
  const input = { kind, values } as SimulationInput
  return validSimulation(input) ? input : null
}

/** Read both the current format and the original flat mortgage saves. */
export function parseSavedSimulations(kind: SimulationKind, raw: unknown) {
  if (!Array.isArray(raw)) throw new TypeError('Format de sauvegarde invalide.')
  const simulations: SavedSimulation[] = []
  const ids = new Set<string>()
  for (const entry of raw) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.id !== 'string' ||
      !entry.id ||
      ids.has(entry.id) ||
      typeof entry.date !== 'string'
    )
      continue
    const name = cleanSimulationName(entry.name)
    if (!name) continue
    const legacy = kind === 'mortgage' && entry.version === undefined && entry.values === undefined
    if (!legacy && (entry.version !== 1 || entry.kind !== kind)) continue
    const input = storedInput(
      kind,
      legacy
        ? {
            montantPret: entry.montant,
            tauxInteret: entry.taux,
            dureeAnnees: entry.duree,
            tauxAssurance: entry.assurance,
          }
        : entry.values
    )
    if (!input) continue
    simulations.push({
      ...input,
      version: 1,
      id: entry.id,
      name,
      customName: legacy || entry.customName === true,
      date: entry.date,
    })
    ids.add(entry.id)
  }
  return { simulations, discarded: raw.length - simulations.length }
}

export function sameSimulation(a: SimulationInput, b: SimulationInput) {
  if (a.kind !== b.kind) return false
  const defaults = a.kind === 'mortgage' ? mortgageDefaults : propertyDefaults
  return Object.keys(defaults).every((key) => a.values[key] === b.values[key])
}
