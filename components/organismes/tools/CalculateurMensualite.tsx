'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'
import { Calculator, Info, TrendingUp, Wallet, Calendar, ArrowRightLeft } from 'lucide-react'

export default function CalculateurMensualite() {
  const [montantPret, setMontantPret] = useState(200000)
  const [tauxInteret, setTauxInteret] = useState(3.5)
  const [dureeAnnees, setDureeAnnees] = useState(20)
  const [tauxAssurance, setTauxAssurance] = useState(0.3)

  const {
    mensualiteHorsAssurance,
    mensualiteAssurance,
    mensualiteTotale,
    coutTotalInterets,
    coutTotalAssurance,
    percentTotalInterets,
    coutTotalPret,
    amortissementData,
  } = useMemo(() => {
    const L = montantPret
    const r = tauxInteret / 100 / 12
    const n = dureeAnnees * 12
    const rAssurance = tauxAssurance / 100 / 12

    let M = 0
    if (r > 0) {
      M = (L * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    } else {
      M = L / n
    }

    const mAssurance = (L * (tauxAssurance / 100)) / 12

    const data = []
    let balance = L
    let cumulInterets = 0
    let cumulPrincipal = 0

    for (let year = 1; year <= dureeAnnees; year++) {
      let interetsAnnuels = 0
      let principalAnnuel = 0

      for (let month = 1; month <= 12; month++) {
        const interetMois = balance * r
        const principalMois = M - interetMois

        interetsAnnuels += interetMois
        principalAnnuel += principalMois
        balance = Math.max(0, balance - principalMois)
      }

      const totalAnnuel = interetsAnnuels + principalAnnuel + mAssurance * 12
      cumulInterets += interetsAnnuels
      cumulPrincipal += principalAnnuel

      data.push({
        year,
        interets: Math.round(interetsAnnuels),
        principal: Math.round(principalAnnuel),
        assurance: Math.round(mAssurance * 12),
        percentInterets: ((interetsAnnuels / totalAnnuel) * 100).toFixed(1),
        percentPrincipal: ((principalAnnuel / totalAnnuel) * 100).toFixed(1),
        balanceRestante: Math.round(balance),
        cumulInterets: Math.round(cumulInterets),
      })
    }

    return {
      mensualiteHorsAssurance: M,
      mensualiteAssurance: mAssurance,
      mensualiteTotale: M + mAssurance,
      coutTotalInterets: cumulInterets,
      coutTotalAssurance: mAssurance * n,
      percentTotalInterets: ((cumulInterets / L) * 100).toFixed(1),
      coutTotalPret: cumulInterets + mAssurance * n,
      amortissementData: data,
    }
  }, [montantPret, tauxInteret, dureeAnnees, tauxAssurance])

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Contrôles */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                <Calculator className="h-4 w-4 text-primary" /> Paramètres du prêt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Montant du prêt</Label>
                  <span className="font-bold text-primary">{montantPret.toLocaleString()} €</span>
                </div>
                <Slider
                  min={10000}
                  max={1000000}
                  step={5000}
                  value={[montantPret]}
                  onValueChange={(v) => setMontantPret(v[0])}
                />
                <Input
                  type="number"
                  value={montantPret}
                  onChange={(e) => setMontantPret(Number(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Taux d'intérêt (%)</Label>
                  <span className="font-bold text-primary">{tauxInteret} %</span>
                </div>
                <Slider
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={[tauxInteret]}
                  onValueChange={(v) => setTauxInteret(v[0])}
                />
                <Input
                  type="number"
                  step="0.1"
                  value={tauxInteret}
                  onChange={(e) => setTauxInteret(Number(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Durée (années)</Label>
                  <span className="font-bold text-primary">{dureeAnnees} ans</span>
                </div>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[dureeAnnees]}
                  onValueChange={(v) => setDureeAnnees(v[0])}
                />
                <Input
                  type="number"
                  value={dureeAnnees}
                  onChange={(e) => setDureeAnnees(Number(e.target.value))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Taux d'assurance (%)</Label>
                  <span className="font-bold text-primary">{tauxAssurance} %</span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.05}
                  value={[tauxAssurance]}
                  onValueChange={(v) => setTauxAssurance(v[0])}
                />
                <Input
                  type="number"
                  step="0.05"
                  value={tauxAssurance}
                  onChange={(e) => setTauxAssurance(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-primary">
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Mensualité (hors ass.)</span>
                <span className="font-bold">
                  {Math.round(mensualiteHorsAssurance).toLocaleString()} €
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Assurance / mois</span>
                <span className="font-bold">
                  {Math.round(mensualiteAssurance).toLocaleString()} €
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Coût total intérêts</span>
                  <span className="text-[10px] text-red-500/70">
                    ({percentTotalInterets}% du prêt)
                  </span>
                </div>
                <span className="font-bold text-red-500">
                  {Math.round(coutTotalInterets).toLocaleString()} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Coût total assurance</span>
                <span className="font-bold">
                  {Math.round(coutTotalAssurance).toLocaleString()} €
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultats et Graphiques */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Card className="border-primary bg-primary text-white shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">
                Mensualité Totale
              </p>
              <p className="text-6xl font-black">
                {Math.round(mensualiteTotale).toLocaleString()} €
              </p>
              <div className="mt-4 flex gap-4 text-xs opacity-90">
                <span>
                  Principal + Intérêts : {Math.round(mensualiteHorsAssurance).toLocaleString()}€
                </span>
                <span>•</span>
                <span>Assurance : {Math.round(mensualiteAssurance).toLocaleString()}€</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <ArrowRightLeft className="h-3 w-3" /> Répartition Annuelle
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Part des intérêts vs principal par an
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amortissementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis
                      dataKey="year"
                      fontSize={10}
                      label={{
                        value: 'Années',
                        position: 'insideBottom',
                        offset: -5,
                        fontSize: 10,
                      }}
                    />
                    <YAxis fontSize={10} tickFormatter={(v) => `${v}€`} />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const { payload } = props
                        const percent =
                          name === 'Intérêts' ? payload.percentInterets : payload.percentPrincipal
                        return [`${value.toLocaleString()} € (${percent}%)`, name]
                      }}
                      contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar name="Principal" dataKey="principal" stackId="a" fill="#10b981" />
                    <Bar name="Intérêts" dataKey="interets" stackId="a" fill="#ef4444" />
                    <Bar name="Assurance" dataKey="assurance" stackId="a" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="h-3 w-3" /> Capital Restant Dû
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Évolution de la dette au fil des ans
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={amortissementData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="year" fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${v / 1000}k€`} />
                    <Tooltip
                      formatter={(v) => `${v.toLocaleString()} €`}
                      contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    />
                    <Area
                      name="Capital restant"
                      type="monotone"
                      dataKey="balanceRestante"
                      stroke="#10b981"
                      fill="url(#colorBalance)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                <Calendar className="h-4 w-4" /> Tableau d'amortissement (Annuel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Année</th>
                      <th className="px-4 py-3 text-right">Principal</th>
                      <th className="px-4 py-3 text-right">Intérêts</th>
                      <th className="px-4 py-3 text-right">Part Int. (%)</th>
                      <th className="px-4 py-3 text-right">Capital Restant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {amortissementData.map((row) => (
                      <tr key={row.year} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">An {row.year}</td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {row.principal.toLocaleString()} €
                        </td>
                        <td className="px-4 py-3 text-right text-red-500">
                          {row.interets.toLocaleString()} €
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{row.percentInterets}%</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {row.balanceRestante.toLocaleString()} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Info className="h-5 w-5 text-primary" />
          Comprendre l'amortissement
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            Dans un prêt à mensualités constantes, la répartition entre le remboursement du capital
            (le principal) et les intérêts évolue chaque mois. Au début, les intérêts sont calculés
            sur le montant total emprunté, ils représentent donc une part importante de votre
            mensualité.
          </p>
          <p>
            Au fur et à mesure que vous remboursez, le capital restant diminue, et donc les intérêts
            dus chaque mois baissent. En conséquence, la part de votre mensualité consacrée au
            remboursement du capital augmente. C'est ce qu'on appelle "l'amortissement".
          </p>
        </div>
      </div>
    </div>
  )
}
