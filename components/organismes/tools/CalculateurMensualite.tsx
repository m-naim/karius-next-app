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
import {
  Calculator,
  Info,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowRightLeft,
  Save,
  Trash2,
  FolderOpen,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface Simulation {
  id: string
  name: string
  montant: number
  taux: number
  duree: number
  assurance: number
  date: string
}

export default function CalculateurMensualite() {
  const { toast } = useToast()
  const [montantPret, setMontantPret] = useState(200000)
  const [tauxInteret, setTauxInteret] = useState(3.5)
  const [dureeAnnees, setDureeAnnees] = useState(20)
  const [tauxAssurance, setTauxAssurance] = useState(0.3)
  const [saveName, setSaveName] = useState('')
  const [savedSimulations, setSavedSimulations] = useState<Simulation[]>([])

  // Load simulations on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('mortgage_simulations')
    if (saved) setSavedSimulations(JSON.parse(saved))
  }, [])

  const handleSave = () => {
    if (!saveName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez donner un nom à votre simulation.',
      })
      return
    }
    const newSim: Simulation = {
      id: Date.now().toString(),
      name: saveName,
      montant: montantPret,
      taux: tauxInteret,
      duree: dureeAnnees,
      assurance: tauxAssurance,
      date: new Date().toLocaleDateString('fr-FR'),
    }
    const updated = [...savedSimulations, newSim]
    setSavedSimulations(updated)
    localStorage.setItem('mortgage_simulations', JSON.stringify(updated))
    setSaveName('')
    toast({ title: 'Succès', description: 'Simulation enregistrée localement.' })
  }

  const loadSimulation = (sim: Simulation) => {
    setMontantPret(sim.montant)
    setTauxInteret(sim.taux)
    setDureeAnnees(sim.duree)
    setTauxAssurance(sim.assurance)
    toast({ title: 'Chargé', description: `Simulation "${sim.name}" appliquée.` })
  }

  const deleteSimulation = (id: string) => {
    const updated = savedSimulations.filter((s) => s.id !== id)
    setSavedSimulations(updated)
    localStorage.setItem('mortgage_simulations', JSON.stringify(updated))
  }

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

    const data: any = []
    let balance = L
    let cumulInterets = 0
    let cumulPrincipal = 0
    let cumulAssurance = 0

    for (let year = 1; year <= dureeAnnees; year++) {
      let interetsAnnuels = 0
      let principalAnnuel = 0
      const assuranceAnnuelle = mAssurance * 12

      for (let month = 1; month <= 12; month++) {
        const interetMois = balance * r
        const principalMois = M - interetMois

        interetsAnnuels += interetMois
        principalAnnuel += principalMois
        balance = Math.max(0, balance - principalMois)
      }

      const totalAnnuel = interetsAnnuels + principalAnnuel + assuranceAnnuelle
      cumulInterets += interetsAnnuels
      cumulPrincipal += principalAnnuel
      cumulAssurance += assuranceAnnuelle

      data.push({
        year,
        interets: Math.round(interetsAnnuels),
        principal: Math.round(principalAnnuel),
        assurance: Math.round(assuranceAnnuelle),
        totalPaye: Math.round(totalAnnuel),
        cumulFrais: Math.round(cumulInterets + cumulAssurance),
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

              <div className="space-y-3 border-t pt-4">
                <Label className="text-xs">Sauvegarder cette simulation</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom (ex: Appart Lyon)"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" className="h-8 px-2" onClick={handleSave}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {savedSimulations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5" /> Mes Simulations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] divide-y overflow-y-auto">
                  {savedSimulations.map((sim) => (
                    <div
                      key={sim.id}
                      className="group flex items-center justify-between p-3 transition-colors hover:bg-muted/50"
                    >
                      <button onClick={() => loadSimulation(sim)} className="flex-1 text-left">
                        <p className="truncate text-sm font-bold">{sim.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {sim.montant.toLocaleString()}€ • {sim.taux}% • {sim.duree}ans
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                        onClick={() => deleteSimulation(sim.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
          <Card className="relative overflow-hidden border-none bg-slate-900 text-white shadow-xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <CardContent className="relative z-10 flex flex-col items-center justify-center py-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Mensualité Totale
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-black tracking-tighter md:text-7xl">
                  {Math.round(mensualiteTotale).toLocaleString()}
                </p>
                <span className="text-3xl font-bold text-primary">€</span>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Crédit : </span>
                  <span className="font-bold">
                    {Math.round(mensualiteHorsAssurance).toLocaleString()}€
                  </span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-6">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-slate-300">Assurance : </span>
                  <span className="font-bold">
                    {Math.round(mensualiteAssurance).toLocaleString()}€
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <ArrowRightLeft className="h-3 w-3" /> Répartition Annuelle
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Part des intérêts vs principal par an
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
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
                  <TrendingUp className="h-3 w-3" /> Coût Cumulé
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Somme totale des frais (Intérêts + Assurance)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={amortissementData}>
                    <defs>
                      <linearGradient id="colorFrais" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                      name="Cumul frais"
                      type="monotone"
                      dataKey="cumulFrais"
                      stroke="#ef4444"
                      fill="url(#colorFrais)"
                      strokeWidth={3}
                    />
                  </AreaChart>
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
              <CardContent className="h-[250px]">
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
                      <th className="px-4 py-3 text-right">Assurance</th>
                      <th className="px-4 py-3 text-right font-bold">Total Payé</th>
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
                        <td className="px-4 py-3 text-right text-indigo-500">
                          {row.assurance.toLocaleString()} €
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary">
                          {row.totalPaye.toLocaleString()} €
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
