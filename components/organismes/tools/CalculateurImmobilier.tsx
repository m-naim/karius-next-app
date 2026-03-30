'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  Info,
  Calculator,
  Home,
  ArrowRight,
  TrendingUp,
  Wallet,
  LineChart as ChartIcon,
} from 'lucide-react'

export default function CalculateurImmobilier() {
  // --- Acquisition ---
  const [prixBien, setPrixBien] = useState(250000)
  const [apport, setApport] = useState(50000)
  const [tauxInteret, setTauxInteret] = useState(3.5)
  const [dureeAnnees, setDureeAnnees] = useState(25)
  const [tauxAssurance, setTauxAssurance] = useState(0.35)
  const [fraisNotaireTaux, setFraisNotaireTaux] = useState(7.5)

  // --- Charges Annuelles ---
  const [taxeFonciere, setTaxeFonciere] = useState(1200)
  const [chargesCopropriete, setChargesCopropriete] = useState(1500)
  const [entretienAnnuel, setEntretienAnnuel] = useState(1000)

  // --- Location ---
  const [loyerMensuel, setLoyerMensuel] = useState(1000)
  const [inflationLoyer, setInflationLoyer] = useState(2)

  // --- Marché & Épargne ---
  const [rendementEpargne, setRendementEpargne] = useState(5)
  const [appreciationImmo, setAppreciationImmo] = useState(1.5)

  // --- Calculations ---
  const {
    montantPret,
    fraisNotaire,
    mensualiteAssurance,
    mensualiteCreditHorsAssurance,
    mensualiteTotaleCredit,
    mensualiteAvecCharges,
    coutTotalCredit,
    coutTotalAchat,
    dataSimulation,
    anneeEquilibre,
  } = useMemo(() => {
    const P = prixBien
    const A = apport
    const FN = (fraisNotaireTaux / 100) * P
    const L = Math.max(0, P + FN - A)
    const r = tauxInteret / 100 / 12
    const n = dureeAnnees * 12

    let M = 0
    if (r > 0 && L > 0) {
      M = (L * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    } else if (L > 0) {
      M = L / n
    }

    const mAssurance = (L * (tauxAssurance / 100)) / 12
    const mTotaleCredit = M + mAssurance

    // Calcul des charges mensuelles
    const mChargesTaxes = (taxeFonciere + chargesCopropriete + entretienAnnuel) / 12
    const mGlobale = mTotaleCredit + mChargesTaxes

    const coutCreditTotal = mTotaleCredit * n - L
    const totalAchat = P + FN + coutCreditTotal

    const simulation = [] as {
      year: number
      'Coût Location': number
      'Frais perdus Achat': number
      'Patrimoine Achat': number
      'Patrimoine Location': number
    }[]

    let cumulLoyer = 0
    let cumulFraisPerdusAchat = FN
    let balanceRestante = L
    let breakEvenYear: number | null = null

    let patrimoineLocataire = A
    let rEpargneMois = rendementEpargne / 100 / 12

    for (let year = 1; year <= 30; year++) {
      const inflationLoyerFacteur = Math.pow(1 + inflationLoyer / 100, year - 1)
      const loyerMensuelActuel = loyerMensuel * inflationLoyerFacteur
      cumulLoyer += loyerMensuelActuel * 12

      let interetAnnee = 0
      if (year <= dureeAnnees && L > 0) {
        for (let m = 0; m < 12; m++) {
          const interetMois = balanceRestante * r
          const principalMois = M - interetMois
          interetAnnee += interetMois
          balanceRestante = Math.max(0, balanceRestante - principalMois)
        }
      }

      const fraisProprioAnnee = taxeFonciere + chargesCopropriete + entretienAnnuel
      const assuranceAnnuelle = year <= dureeAnnees && L > 0 ? mAssurance * 12 : 0
      cumulFraisPerdusAchat += interetAnnee + assuranceAnnuelle + fraisProprioAnnee

      const valeurMaison = P * Math.pow(1 + appreciationImmo / 100, year)
      const patrimoineAchat = valeurMaison - balanceRestante

      const mensualiteImmoTotalMois =
        (year <= dureeAnnees ? mTotaleCredit : 0) + fraisProprioAnnee / 12
      const diffEpargneMois = mensualiteImmoTotalMois - loyerMensuelActuel

      for (let m = 0; m < 12; m++) {
        patrimoineLocataire = (patrimoineLocataire + diffEpargneMois) * (1 + rEpargneMois)
      }

      simulation.push({
        year,
        'Coût Location': Math.round(cumulLoyer),
        'Frais perdus Achat': Math.round(cumulFraisPerdusAchat),
        'Patrimoine Achat': Math.round(patrimoineAchat),
        'Patrimoine Location': Math.round(patrimoineLocataire),
      })

      if (breakEvenYear === null && cumulFraisPerdusAchat < cumulLoyer) {
        breakEvenYear = year
      }
    }

    return {
      montantPret: L,
      fraisNotaire: FN,
      mensualiteCreditHorsAssurance: M,
      mensualiteAssurance: mAssurance,
      mensualiteTotaleCredit: mTotaleCredit,
      mensualiteAvecCharges: mGlobale,
      coutTotalCredit: coutCreditTotal,
      coutTotalAchat: totalAchat,
      dataSimulation: simulation,
      anneeEquilibre: breakEvenYear,
    }
  }, [
    prixBien,
    apport,
    tauxInteret,
    dureeAnnees,
    tauxAssurance,
    fraisNotaireTaux,
    taxeFonciere,
    chargesCopropriete,
    entretienAnnuel,
    loyerMensuel,
    inflationLoyer,
    rendementEpargne,
    appreciationImmo,
  ])

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Paramètres (Gauche) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-primary" /> Acquisition & Crédit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs">Prix du bien (€)</Label>
                <Input
                  type="number"
                  value={prixBien}
                  onChange={(e) => setPrixBien(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Apport personnel (€)</Label>
                  <span className="text-xs font-bold text-primary">
                    {Math.round((apport / prixBien) * 100)}%
                  </span>
                </div>
                <Input
                  type="number"
                  value={apport}
                  onChange={(e) => setApport(Number(e.target.value))}
                />
                <p className="text-[10px] italic leading-tight text-muted-foreground">
                  L'apport finance d'abord les {Math.round(fraisNotaire).toLocaleString()}€ de
                  notaire.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Taux (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tauxInteret}
                    onChange={(e) => setTauxInteret(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Assur. (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tauxAssurance}
                    onChange={(e) => setTauxAssurance(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Durée (ans)</Label>
                  <Input
                    type="number"
                    value={dureeAnnees}
                    onChange={(e) => setDureeAnnees(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Slider
                  min={5}
                  max={30}
                  step={1}
                  value={[dureeAnnees]}
                  onValueChange={(v) => setDureeAnnees(v[0])}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={fraisNotaireTaux === 7.5 ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 text-[10px]"
                  onClick={() => setFraisNotaireTaux(7.5)}
                >
                  Ancien (7.5%)
                </Button>
                <Button
                  variant={fraisNotaireTaux === 2.5 ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 text-[10px]"
                  onClick={() => setFraisNotaireTaux(2.5)}
                >
                  Neuf (2.5%)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-primary" /> Charges Annuelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Taxe Foncière</Label>
                  <Input
                    type="number"
                    value={taxeFonciere}
                    onChange={(e) => setTaxeFonciere(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Charges Copro</Label>
                  <Input
                    type="number"
                    value={chargesCopropriete}
                    onChange={(e) => setChargesCopropriete(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Entretien / Travaux</Label>
                <Input
                  type="number"
                  value={entretienAnnuel}
                  onChange={(e) => setEntretienAnnuel(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" /> Marché & Épargne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Loyer équivalent</Label>
                  <span className="text-xs font-bold">{loyerMensuel}€</span>
                </div>
                <Slider
                  min={400}
                  max={3000}
                  step={50}
                  value={[loyerMensuel]}
                  onValueChange={(v) => setLoyerMensuel(v[0])}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Rendement épargne</Label>
                  <span className="text-xs font-bold">{rendementEpargne}%</span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={[rendementEpargne]}
                  onValueChange={(v) => setRendementEpargne(v[0])}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Hausse immo / an</Label>
                  <span className="text-xs font-bold">{appreciationImmo}%</span>
                </div>
                <Slider
                  min={-2}
                  max={5}
                  step={0.1}
                  value={[appreciationImmo]}
                  onValueChange={(v) => setAppreciationImmo(v[0])}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultats (Droite) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="flex flex-col justify-center border-primary bg-primary py-4 text-white shadow-xl">
              <CardContent className="p-0 px-6 text-center">
                <p className="text-xs font-bold uppercase tracking-tighter opacity-90">
                  Mensualité Globale (TTC)
                </p>
                <p className="text-5xl font-black">
                  {Math.round(mensualiteAvecCharges).toLocaleString()} €
                </p>
                <p className="text-[10px] italic opacity-80">
                  Crédit + Assurance + Charges + Taxes
                </p>
              </CardContent>
            </Card>
            <Card className="flex flex-col justify-center border-primary/20 bg-primary/5 py-4">
              <CardContent className="p-0 px-6 text-center">
                <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                  Coût Total de l'opération
                </p>
                <p className="text-4xl font-black text-primary">
                  {Math.round(coutTotalAchat).toLocaleString()} €
                </p>
                <p className="text-[10px] italic text-muted-foreground">
                  Prix + Notaire + Intérêts + Assurance
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Mensualité Crédit
                </p>
                <p className="text-xl font-bold text-primary">
                  {Math.round(mensualiteTotaleCredit).toLocaleString()} €
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Dont {Math.round(mensualiteAssurance)}€ d'assurance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Montant emprunté
                </p>
                <p className="text-xl font-bold">{Math.round(montantPret).toLocaleString()} €</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Coût du crédit
                </p>
                <p className="text-xl font-bold">
                  {Math.round(coutTotalCredit).toLocaleString()} €
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Wallet className="h-3 w-3" /> Frais Perdus Cumulés
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataSimulation}>
                    <defs>
                      <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="year" fontSize={10} />
                    <YAxis tickFormatter={(v) => `${v / 1000}k`} fontSize={10} />
                    <Tooltip
                      contentStyle={{ fontSize: '10px' }}
                      formatter={(v) => `${v.toLocaleString()} €`}
                    />
                    <Area
                      type="monotone"
                      dataKey="Coût Location"
                      stroke="#ef4444"
                      fill="url(#colorRent)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="Frais perdus Achat"
                      stroke="#10b981"
                      fill="url(#colorBuy)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <ChartIcon className="h-3 w-3" /> Patrimoine Net
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataSimulation}>
                    <defs>
                      <linearGradient id="colorPatLoc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPatBuy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="year" fontSize={10} />
                    <YAxis tickFormatter={(v) => `${v / 1000}k`} fontSize={10} />
                    <Tooltip
                      contentStyle={{ fontSize: '10px' }}
                      formatter={(v) => `${v.toLocaleString()} €`}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Area
                      name="Patrimoine Location"
                      type="monotone"
                      dataKey="Patrimoine Location"
                      stroke="#6366f1"
                      fill="url(#colorPatLoc)"
                      strokeWidth={2}
                    />
                    <Area
                      name="Patrimoine Achat"
                      type="monotone"
                      dataKey="Patrimoine Achat"
                      stroke="#f59e0b"
                      fill="url(#colorPatBuy)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex gap-4 p-4">
              <Info className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="text-xs">
                <p className="font-bold">Analyse du point d'équilibre :</p>
                <p className="mt-1 text-muted-foreground">
                  {anneeEquilibre
                    ? `L'achat devient rentable au bout de ${anneeEquilibre} ans en termes de coûts secs. `
                    : 'La location est plus économique sur 30 ans au niveau des frais perdus. '}
                  Le graphique de patrimoine montre qu'avec un rendement de placement de{' '}
                  {rendementEpargne}% et une hausse immo de {appreciationImmo}%, le scénario le plus
                  riche à terme est celui avec la courbe la plus haute.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRight className="h-5 w-5 text-primary" /> Guide d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-sm dark:prose-invert">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="flex items-center gap-2 font-bold">
                <Calculator className="h-4 w-4" /> 1. Configurez votre achat
              </h4>
              <p>
                Saisissez le prix du bien et votre apport. Notre outil calcule le prêt nécessaire en
                déduisant d'abord les frais de notaire de votre apport.
              </p>
            </div>
            <div>
              <h4 className="flex items-center gap-2 font-bold">
                <Wallet className="h-4 w-4" /> 2. Détaillez les charges
              </h4>
              <p>
                N'oubliez pas la taxe foncière et les charges de copropriété. Ce sont des "frais
                perdus" propres au propriétaire.
              </p>
            </div>
            <div>
              <h4 className="flex items-center gap-2 font-bold">
                <TrendingUp className="h-4 w-4" /> 3. Comparez intelligemment
              </h4>
              <p>
                Ajustez le rendement de l'épargne. Si vous ne placez pas votre argent dans une
                maison, où va-t-il ? La comparaison de patrimoine simule le placement de votre
                apport en bourse.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
