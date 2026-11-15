export interface NumberRule {
  min: number
  max: number
  integer?: boolean
}

export const mortgageDefaults = {
  montantPret: 200000,
  tauxInteret: 3.5,
  dureeAnnees: 20,
  tauxAssurance: 0.3,
}

export const mortgageRules: Record<keyof typeof mortgageDefaults, NumberRule> = {
  montantPret: { min: 0, max: 120000000 },
  tauxInteret: { min: 0, max: 30 },
  dureeAnnees: { min: 1, max: 30, integer: true },
  tauxAssurance: { min: 0, max: 10 },
}

export const propertyDefaults = {
  prixBien: 250000,
  apport: 50000,
  tauxInteret: 3.5,
  dureeAnnees: 25,
  tauxAssurance: 0.35,
  fraisNotaireTaux: 7.5,
  taxeFonciere: 1200,
  chargesCopropriete: 1500,
  entretienAnnuel: 1000,
  loyerMensuel: 1000,
  inflationLoyer: 2,
  rendementEpargne: 5,
  appreciationImmo: 1.5,
  dureeDetention: 15,
}

export const propertyRules: Record<keyof typeof propertyDefaults, NumberRule> = {
  prixBien: { min: 1, max: 100000000 },
  apport: { min: 0, max: 120000000 },
  tauxInteret: mortgageRules.tauxInteret,
  dureeAnnees: mortgageRules.dureeAnnees,
  tauxAssurance: mortgageRules.tauxAssurance,
  fraisNotaireTaux: { min: 0, max: 20 },
  taxeFonciere: { min: 0, max: 1000000 },
  chargesCopropriete: { min: 0, max: 1000000 },
  entretienAnnuel: { min: 0, max: 10000000 },
  loyerMensuel: { min: 0, max: 1000000 },
  inflationLoyer: { min: -10, max: 20 },
  rendementEpargne: { min: -20, max: 30 },
  appreciationImmo: { min: -20, max: 20 },
  dureeDetention: { min: 1, max: 30, integer: true },
}

export function numberError(value: number, rule: NumberRule) {
  if (!Number.isFinite(value)) return 'Saisissez un nombre.'
  if (rule.integer && !Number.isInteger(value)) return 'Saisissez un nombre entier d’années.'
  if (value < rule.min || value > rule.max) {
    return `Saisissez une valeur entre ${rule.min.toLocaleString(
      'fr-FR'
    )} et ${rule.max.toLocaleString('fr-FR')}.`
  }
  return undefined
}

export function parseNumber(value: string) {
  const normalized = value.trim().replace(',', '.')
  return /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) ? Number(normalized) : NaN
}

function assertValid<T extends Record<string, number>>(
  values: T,
  rules: Record<keyof T, NumberRule>
) {
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const error = numberError(values[key], rules[key])
    if (error) throw new RangeError(`${String(key)} : ${error}`)
  }
}

export type MortgageInputs = typeof mortgageDefaults
export type PropertyInputs = typeof propertyDefaults

export interface AmortizationYear {
  year: number
  interets: number
  principal: number
  assurance: number
  totalPaye: number
  cumulFrais: number
  percentInterets: string
  percentPrincipal: string
  balanceRestante: number
  cumulInterets: number
}

export function calculateMortgage(inputs: MortgageInputs) {
  assertValid(inputs, mortgageRules)
  const { montantPret, tauxInteret, dureeAnnees, tauxAssurance } = inputs
  const months = dureeAnnees * 12
  const rate = tauxInteret / 1200
  // expm1/log1p also keep very small positive rates numerically stable.
  const mensualiteHorsAssurance =
    rate === 0
      ? montantPret / months
      : (montantPret * rate) / -Math.expm1(-months * Math.log1p(rate))
  const mensualiteAssurance = (montantPret * tauxAssurance) / 1200
  let balance = montantPret
  let cumulInterets = 0
  let cumulAssurance = 0
  const amortissementData: AmortizationYear[] = []

  for (let year = 1; year <= dureeAnnees; year++) {
    let interets = 0
    let principal = 0
    for (let month = 1; month <= 12; month++) {
      const interest = balance * rate
      const repayment =
        year === dureeAnnees && month === 12
          ? balance
          : Math.min(balance, Math.max(0, mensualiteHorsAssurance - interest))
      interets += interest
      principal += repayment
      balance = Math.max(0, balance - repayment)
    }
    const assurance = mensualiteAssurance * 12
    const totalPaye = interets + principal + assurance
    cumulInterets += interets
    cumulAssurance += assurance
    amortissementData.push({
      year,
      interets,
      principal,
      assurance,
      totalPaye,
      cumulFrais: cumulInterets + cumulAssurance,
      percentInterets: (totalPaye ? (interets / totalPaye) * 100 : 0).toFixed(1),
      percentPrincipal: (totalPaye ? (principal / totalPaye) * 100 : 0).toFixed(1),
      balanceRestante: balance,
      cumulInterets,
    })
  }

  return {
    mensualiteHorsAssurance,
    mensualiteAssurance,
    mensualiteTotale: mensualiteHorsAssurance + mensualiteAssurance,
    coutTotalInterets: cumulInterets,
    coutTotalAssurance: cumulAssurance,
    percentTotalInterets: (montantPret ? (cumulInterets / montantPret) * 100 : 0).toFixed(1),
    coutTotalPret: cumulInterets + cumulAssurance,
    amortissementData,
  }
}

export function propertyErrors(inputs: PropertyInputs) {
  const errors: Partial<Record<keyof PropertyInputs, string>> = {}
  for (const key of Object.keys(propertyRules) as (keyof PropertyInputs)[]) {
    const error = numberError(inputs[key], propertyRules[key])
    if (error) errors[key] = error
  }
  const total = inputs.prixBien * (1 + inputs.fraisNotaireTaux / 100)
  if (Number.isFinite(total) && inputs.apport > total) {
    errors.apport = 'L’apport ne peut pas dépasser le prix du bien et les frais d’acquisition.'
  }
  return errors
}

export function calculateBuyVsRent(inputs: PropertyInputs) {
  const errors = propertyErrors(inputs)
  if (Object.keys(errors).length) throw new RangeError(Object.values(errors)[0])
  const fraisNotaire = (inputs.prixBien * inputs.fraisNotaireTaux) / 100
  const montantPret = Math.max(0, inputs.prixBien + fraisNotaire - inputs.apport)
  const mortgage = calculateMortgage({ ...inputs, montantPret })
  const chargesAnnuelles = inputs.taxeFonciere + inputs.chargesCopropriete + inputs.entretienAnnuel
  const monthlyReturn = Math.pow(1 + inputs.rendementEpargne / 100, 1 / 12) - 1
  let cumulLoyer = 0
  let cumulFrais = fraisNotaire
  let epargneAchat = 0
  let epargneLocation = inputs.apport

  const dataSimulation = Array.from({ length: 30 }, (_, index) => {
    const year = index + 1
    const loanYear = mortgage.amortissementData[index]
    const rent = inputs.loyerMensuel * Math.pow(1 + inputs.inflationLoyer / 100, index)
    const buyerBudget = (loanYear ? mortgage.mensualiteTotale : 0) + chargesAnnuelles / 12
    cumulLoyer += rent * 12
    cumulFrais += (loanYear?.interets ?? 0) + (loanYear?.assurance ?? 0) + chargesAnnuelles
    // Same monthly budget for both households. The cheaper option invests the difference.
    for (let month = 0; month < 12; month++) {
      epargneAchat = epargneAchat * (1 + monthlyReturn) + Math.max(0, rent - buyerBudget)
      epargneLocation = epargneLocation * (1 + monthlyReturn) + Math.max(0, buyerBudget - rent)
    }
    return {
      year,
      'Coût Location': cumulLoyer,
      'Frais perdus Achat': cumulFrais,
      'Patrimoine Achat':
        inputs.prixBien * Math.pow(1 + inputs.appreciationImmo / 100, year) -
        (loanYear?.balanceRestante ?? 0) +
        epargneAchat,
      'Patrimoine Location': epargneLocation,
    }
  })
  return {
    montantPret,
    fraisNotaire,
    mensualiteAssurance: mortgage.mensualiteAssurance,
    mensualiteTotaleCredit: mortgage.mensualiteTotale,
    mensualiteAvecCharges: mortgage.mensualiteTotale + chargesAnnuelles / 12,
    coutTotalCredit: mortgage.coutTotalPret,
    coutTotalAchat: inputs.prixBien + fraisNotaire + mortgage.coutTotalPret,
    dataSimulation,
    anneeEquilibreFrais:
      dataSimulation.find((row) => row['Frais perdus Achat'] < row['Coût Location'])?.year ?? null,
    anneeEquilibrePatrimoine:
      dataSimulation.find((row) => row['Patrimoine Achat'] > row['Patrimoine Location'])?.year ??
      null,
    horizon: dataSimulation[inputs.dureeDetention - 1],
  }
}

const queryKeys = {
  montantPret: 'montant',
  tauxInteret: 'taux',
  dureeAnnees: 'duree',
  tauxAssurance: 'assurance',
} as const

export function mortgageHref(inputs: MortgageInputs) {
  assertValid(inputs, mortgageRules)
  const query = new URLSearchParams()
  for (const [key, name] of Object.entries(queryKeys)) query.set(name, String(inputs[key]))
  return `/fr/outils/calculateur-mensualite?${query}`
}

export function readMortgageQuery(query: Record<string, string | string[] | undefined>) {
  const present = Object.values(queryKeys).some((key) => query[key] !== undefined)
  if (!present) return { values: mortgageDefaults, invalid: false, transferred: false }
  const values = { ...mortgageDefaults }
  for (const key of Object.keys(queryKeys) as (keyof MortgageInputs)[]) {
    const raw = query[queryKeys[key]]
    const value = typeof raw === 'string' ? parseNumber(raw) : NaN
    if (numberError(value, mortgageRules[key])) {
      return { values: mortgageDefaults, invalid: true, transferred: false }
    }
    values[key] = value
  }
  return { values, invalid: false, transferred: true }
}
