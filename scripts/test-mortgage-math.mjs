import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  calculateMortgage,
  calculateBuyVsRent,
  mortgageDefaults,
  propertyDefaults,
  numberError,
  parseNumber,
  mortgageRules,
  mortgageHref,
  readMortgageQuery,
} from '../lib/mortgage-math.ts'
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} ≠ ${expected}`)

test('Taux zéro : capital, assurance et échéancier concordent', () => {
  const r = calculateMortgage({
    montantPret: 120000,
    tauxInteret: 0,
    dureeAnnees: 10,
    tauxAssurance: 1.2,
  })
  close(r.mensualiteHorsAssurance, 1000)
  close(r.mensualiteAssurance, 120)
  close(r.mensualiteTotale, 1120)
  close(r.coutTotalInterets, 0)
  close(r.coutTotalAssurance, 14400)
  assert.equal(r.amortissementData.length, 10)
  r.amortissementData.forEach((row) => close(row.principal, 12000))
})
test('Conservation du capital et des paiements ; extinction de la dette', () => {
  const r = calculateMortgage(mortgageDefaults),
    rows = r.amortissementData
  close(
    rows.reduce((s, row) => s + row.principal, 0),
    200000
  )
  close(
    rows.reduce((s, row) => s + row.totalPaye, 0),
    r.mensualiteTotale * 240
  )
  close(r.coutTotalPret, r.coutTotalInterets + r.coutTotalAssurance)
  assert.ok(rows[0].interets > rows.at(-1).interets)
  assert.equal(rows.at(-1).balanceRestante, 0)
  assert.ok(rows.every((row) => row.balanceRestante >= 0))
})
test('Taux positif presque nul : stabilité numérique', () =>
  close(
    calculateMortgage({ ...mortgageDefaults, tauxInteret: 1e-12 }).mensualiteHorsAssurance,
    200000 / 240
  ))
test('Sans emprunt : aucun coût ou pourcentage indéfini', () => {
  const r = calculateMortgage({ ...mortgageDefaults, montantPret: 0 })
  assert.equal(r.mensualiteTotale, 0)
  assert.equal(r.coutTotalPret, 0)
  assert.equal(r.percentTotalInterets, '0.0')
  assert.ok(
    r.amortissementData.every((row) => row.percentInterets === '0.0' && row.balanceRestante === 0)
  )
})
test('Les moteurs refusent durées nulles, fractionnaires, montants négatifs et valeurs non finies', () => {
  for (const patch of [
    { dureeAnnees: 0 },
    { dureeAnnees: 1.5 },
    { dureeAnnees: 31 },
    { montantPret: -1 },
    { tauxInteret: NaN },
    { tauxAssurance: Infinity },
  ])
    assert.throws(() => calculateMortgage({ ...mortgageDefaults, ...patch }), RangeError)
  for (const patch of [{ apport: 999999 }, { dureeDetention: 0 }, { prixBien: 0 }])
    assert.throws(() => calculateBuyVsRent({ ...propertyDefaults, ...patch }), RangeError)
})
test('Saisie vide invalide ; virgule et taux zéro acceptés', () => {
  for (const value of ['', ' ', '-', 'Infinity', 'abc', '1.2.3', '0x10'])
    assert.ok(Number.isNaN(parseNumber(value)))
  assert.equal(parseNumber('3,75'), 3.75)
  assert.equal(parseNumber('0'), 0)
  assert.equal(numberError(0, mortgageRules.tauxInteret), undefined)
  assert.ok(numberError(0, mortgageRules.dureeAnnees))
})
test('Seuils des frais et du patrimoine distincts', () => {
  const r = calculateBuyVsRent(propertyDefaults)
  assert.equal(r.anneeEquilibreFrais, 10)
  assert.equal(r.anneeEquilibrePatrimoine, 12)
  assert.ok(r.dataSimulation[9]['Patrimoine Location'] > r.dataSimulation[9]['Patrimoine Achat'])
})
test('La détention sélectionne le bilan sans modifier le prêt ni les seuils', () => {
  const a = calculateBuyVsRent({ ...propertyDefaults, dureeDetention: 5 }),
    b = calculateBuyVsRent({ ...propertyDefaults, dureeDetention: 30 })
  assert.equal(a.horizon.year, 5)
  assert.equal(b.horizon.year, 30)
  assert.deepEqual(a.horizon, b.dataSimulation[4])
  assert.equal(a.mensualiteTotaleCredit, b.mensualiteTotaleCredit)
  assert.equal(a.anneeEquilibrePatrimoine, b.anneeEquilibrePatrimoine)
})
test('L’acheteur place ses économies ; le portefeuille locataire reste positif', () => {
  const r = calculateBuyVsRent({
    ...propertyDefaults,
    prixBien: 120000,
    apport: 120000,
    fraisNotaireTaux: 0,
    taxeFonciere: 0,
    chargesCopropriete: 0,
    entretienAnnuel: 0,
    rendementEpargne: 0,
    appreciationImmo: 0,
    inflationLoyer: 0,
    loyerMensuel: 1000,
  })
  assert.equal(r.montantPret, 0)
  close(r.dataSimulation[0]['Patrimoine Achat'], 132000)
  close(r.dataSimulation.at(-1)['Patrimoine Achat'], 480000)
  assert.ok(r.dataSimulation.every((row) => row['Patrimoine Location'] === 120000))
})
test('Budget et capital restant dû identiques dans les deux outils', () => {
  const a = calculateBuyVsRent(propertyDefaults),
    b = calculateMortgage({ ...propertyDefaults, montantPret: a.montantPret })
  close(a.mensualiteTotaleCredit, b.mensualiteTotale)
  close(a.coutTotalCredit, b.coutTotalPret)
  close(
    a.dataSimulation[0]['Patrimoine Achat'],
    propertyDefaults.prixBien * 1.015 - b.amortissementData[0].balanceRestante
  )
})
test('Après la fin du crédit, l’acheteur place le budget libéré chaque mois', () => {
  const result = calculateBuyVsRent({
    ...propertyDefaults,
    prixBien: 12000,
    apport: 0,
    fraisNotaireTaux: 0,
    dureeAnnees: 1,
    tauxInteret: 0,
    tauxAssurance: 0,
    taxeFonciere: 0,
    chargesCopropriete: 0,
    entretienAnnuel: 0,
    rendementEpargne: 0,
    appreciationImmo: 0,
    inflationLoyer: 0,
    loyerMensuel: 1000,
  })
  close(result.dataSimulation[0]['Patrimoine Achat'], 12000)
  close(result.dataSimulation[1]['Patrimoine Achat'], 24000)
  close(result.dataSimulation[2]['Patrimoine Achat'], 36000)
  assert.ok(result.dataSimulation.every((row) => row['Patrimoine Location'] === 0))
})
test('Rendement annuel converti en taux mensuel équivalent, versements en fin de mois', () => {
  const r = calculateBuyVsRent({
      ...propertyDefaults,
      loyerMensuel: 0,
      tauxInteret: 0,
      tauxAssurance: 0,
      apport: 0,
      rendementEpargne: 5,
      taxeFonciere: 0,
      chargesCopropriete: 0,
      entretienAnnuel: 0,
    }),
    rate = 1.05 ** (1 / 12) - 1
  close(
    r.dataSimulation[0]['Patrimoine Location'],
    (r.mensualiteTotaleCredit * ((1 + rate) ** 12 - 1)) / rate
  )
})
test('Seuil absent explicite ; calculs finis aux bornes autorisées', () => {
  const r = calculateBuyVsRent({
    ...propertyDefaults,
    loyerMensuel: 0,
    appreciationImmo: -20,
    rendementEpargne: 30,
  })
  assert.equal(r.anneeEquilibreFrais, null)
  assert.equal(r.anneeEquilibrePatrimoine, null)
  const max = calculateBuyVsRent({
    ...propertyDefaults,
    prixBien: 100000000,
    apport: 0,
    fraisNotaireTaux: 20,
    tauxInteret: 30,
    tauxAssurance: 10,
  })
  assert.ok(max.dataSimulation.every((row) => Object.values(row).every(Number.isFinite)))
})
test('Transfert exact du crédit, décimales et montant nul inclus', () => {
  for (const montantPret of [218750, 218750.125, 0]) {
    const values = {
        montantPret,
        tauxInteret: 3.75,
        dureeAnnees: 25,
        tauxAssurance: 0.35,
      },
      url = new URL(mortgageHref(values), 'https://example.test'),
      r = readMortgageQuery(Object.fromEntries(url.searchParams))
    assert.deepEqual(r.values, values)
    assert.equal(r.transferred, true)
    assert.equal(r.invalid, false)
  }
})
test('Liens incomplets, dupliqués ou invalides : retour explicite aux valeurs par défaut', () => {
  for (const query of [
    { montant: '100000' },
    { montant: '100000', taux: '3.5', duree: '0', assurance: '0.3' },
    { montant: '100000', taux: ['3', '4'], duree: '20', assurance: '0.3' },
    { montant: '', taux: '3.5', duree: '20', assurance: '0.3' },
  ]) {
    const r = readMortgageQuery(query)
    assert.equal(r.invalid, true)
    assert.deepEqual(r.values, mortgageDefaults)
  }
  assert.deepEqual(readMortgageQuery({}), {
    values: mortgageDefaults,
    invalid: false,
    transferred: false,
  })
})
