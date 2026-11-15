import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import {
  mortgageDefaults,
  propertyDefaults,
  readMortgageQuery,
  calculateBuyVsRent,
} from '../lib/mortgage-math.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const bundled = await build({
  absWorkingDir: root,
  entryPoints: ['lib/calculator-simulations.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const {
  simulationName,
  simulationHref,
  readPropertyQuery,
  readSimulationName,
  cleanSimulationName,
  parseSavedSimulations,
  sameSimulation,
} = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
)
const query = (href) => Object.fromEntries(new URL(href, 'https://example.test').searchParams)
const mortgage = { kind: 'mortgage', values: mortgageDefaults }
const property = { kind: 'property', values: propertyDefaults }

test('Les noms automatiques sont descriptifs, stables et disponibles sans saisie', () => {
  const name = simulationName(mortgage)
  assert.match(name, /^Crédit/)
  assert.ok(name.includes('20 ans'))
  assert.ok(name.includes('3,5 %'))
  assert.equal(name, simulationName(mortgage))
  assert.notEqual(
    name,
    simulationName({ ...mortgage, values: { ...mortgageDefaults, montantPret: 300000 } })
  )
  assert.match(
    simulationName({ ...property, values: { ...propertyDefaults, dureeDetention: 1 } }),
    /1 an$/
  )
  assert.match(simulationName(property), /^Achat ou location/)
})
test('Le partage achat/location conserve les 14 paramètres et les résultats', () => {
  const values = {
    ...propertyDefaults,
    prixBien: 337123.45,
    apport: 61234.56,
    taxeFonciere: 0,
    inflationLoyer: -1.25,
    appreciationImmo: -2.5,
    rendementEpargne: 0,
    dureeDetention: 9,
    chargesCopropriete: 2321,
    entretienAnnuel: 5300,
  }
  const href = simulationHref({ kind: 'property', values }),
    decoded = readPropertyQuery(query(href))
  assert.equal(Object.keys(query(href)).length, 14)
  assert.equal(decoded.invalid, false)
  assert.deepEqual(decoded.values, values)
  assert.deepEqual(calculateBuyVsRent(decoded.values), calculateBuyVsRent(values))
  assert.equal(readSimulationName(query(href)), undefined)
})
test('Le partage de crédit conserve les décimales et le montant nul', () => {
  for (const montantPret of [0, 123456.789]) {
    const values = { ...mortgageDefaults, montantPret, tauxInteret: 0, tauxAssurance: 0.125 }
    assert.deepEqual(
      readMortgageQuery(query(simulationHref({ kind: 'mortgage', values }))).values,
      values
    )
  }
})
test('Un nom personnalisé avec accents, &, # et emoji traverse le lien sans altérer les paramètres', () => {
  for (const input of [mortgage, property]) {
    const name = 'Appart été & travaux #2 🏡',
      decoded = query(simulationHref(input, name))
    assert.equal(readSimulationName(decoded), name)
    assert.equal(
      input.kind === 'property'
        ? readPropertyQuery(decoded).invalid
        : readMortgageQuery(decoded).invalid,
      false
    )
  }
  assert.equal(cleanSimulationName('  Appart\nLyon\u0000  '), 'Appart Lyon')
  assert.equal(readSimulationName({ nom: ['a', 'b'] }), undefined)
  assert.equal(cleanSimulationName('x'.repeat(200)).length, 100)
})
test('Les liens incomplets, dupliqués ou incohérents reviennent aux valeurs par défaut', () => {
  const valid = query(simulationHref(property))
  for (const decoded of [
    { prix: '100000' },
    { ...valid, horizon: '0' },
    { ...valid, taux: ['3', '4'] },
    { ...valid, prix: 'Infinity' },
    { ...valid, apport: '99999999' },
  ]) {
    const result = readPropertyQuery(decoded)
    assert.equal(result.invalid, true)
    assert.deepEqual(result.values, propertyDefaults)
  }
  assert.deepEqual(readPropertyQuery({}), {
    values: propertyDefaults,
    invalid: false,
    transferred: false,
  })
  assert.throws(
    () => simulationHref({ ...property, values: { ...propertyDefaults, prixBien: 0 } }),
    RangeError
  )
})
test('Les anciennes sauvegardes de crédit restent lisibles avec leur nom', () => {
  const legacy = {
    id: 'old-1',
    name: 'Ancien appartement',
    montant: 123456,
    taux: 3.5,
    duree: 20,
    assurance: 0.3,
    date: '15/11/2026',
  }
  const parsed = parseSavedSimulations('mortgage', [legacy])
  assert.equal(parsed.discarded, 0)
  assert.equal(parsed.simulations.length, 1)
  const saved = parsed.simulations[0]
  assert.equal(saved.name, legacy.name)
  assert.equal(saved.customName, true)
  assert.equal(saved.id, legacy.id)
  assert.deepEqual(saved.values, {
    montantPret: 123456,
    tauxInteret: 3.5,
    dureeAnnees: 20,
    tauxAssurance: 0.3,
  })
})
test('Les sauvegardes des deux outils supportent un aller-retour JSON complet', () => {
  for (const input of [mortgage, property]) {
    const saved = {
      ...input,
      version: 1,
      id: 'new',
      name: simulationName(input),
      customName: false,
      date: '2026-11-15T12:00:00.000Z',
    }
    const parsed = parseSavedSimulations(input.kind, JSON.parse(JSON.stringify([saved])))
    assert.deepEqual(parsed.simulations, [saved])
    assert.equal(parsed.discarded, 0)
  }
})
test('Une sauvegarde corrompue ou future n’écrase pas les données valides et les IDs restent uniques', () => {
  const saved = {
    ...mortgage,
    version: 1,
    id: 'ok',
    name: 'Crédit',
    customName: true,
    date: '15/11/2026',
  }
  const invalid = { ...saved, id: 'bad', values: { ...mortgageDefaults, dureeAnnees: 0 } }
  const parsed = parseSavedSimulations('mortgage', [
    saved,
    invalid,
    null,
    { ...saved, version: 99 },
    saved,
    { ...saved, kind: 'property' },
  ])
  assert.deepEqual(parsed.simulations, [saved])
  assert.equal(parsed.discarded, 5)
  assert.throws(() => parseSavedSimulations('mortgage', {}), TypeError)
})
test('La détection des doublons prend en compte tous les paramètres, indépendamment de leur ordre', () => {
  assert.equal(
    sameSimulation(property, {
      ...property,
      values: Object.fromEntries(Object.entries(propertyDefaults).reverse()),
    }),
    true
  )
  assert.equal(
    sameSimulation(property, {
      ...property,
      values: { ...propertyDefaults, entretienAnnuel: 1001 },
    }),
    false
  )
  assert.equal(sameSimulation(property, mortgage), false)
})
