'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Pencil, Save, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  cleanSimulationName,
  parseSavedSimulations,
  sameSimulation,
  simulationHref,
  simulationName,
  simulationStorageKeys,
  validSimulation,
  type SavedSimulation,
  type SimulationInput,
} from '@/lib/calculator-simulations'
import type { MortgageInputs, PropertyInputs } from '@/lib/mortgage-math'

type Props = {
  valid: boolean
  initialName?: string
} & (
  | { kind: 'mortgage'; values: MortgageInputs; onLoad: (values: MortgageInputs) => void }
  | { kind: 'property'; values: PropertyInputs; onLoad: (values: PropertyInputs) => void }
)

export default function SimulationActions(props: Props) {
  const [customName, setCustomName] = useState(() => cleanSimulationName(props.initialName))
  const [editingName, setEditingName] = useState(false)
  const [saved, setSaved] = useState<SavedSimulation[]>([])
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [message, setMessage] = useState('')
  const [sharing, setSharing] = useState(false)
  const [manualLink, setManualLink] = useState<{ url: string; name: string } | null>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const nameId = useId()
  const linkId = useId()
  const key = simulationStorageKeys[props.kind]
  const input: SimulationInput =
    props.kind === 'property'
      ? { kind: 'property', values: props.values }
      : { kind: 'mortgage', values: props.values }
  const valid = props.valid && validSimulation(input)
  const autoName = valid ? simulationName(input) : 'Simulation immobilière'
  const name = cleanSimulationName(customName) || autoName

  const readSaved = () => {
    const raw = localStorage.getItem(key)
    return parseSavedSimulations(props.kind, raw ? JSON.parse(raw) : [])
  }

  useEffect(() => {
    const load = () => {
      try {
        const result = readSaved()
        setSaved(result.simulations)
        setStorageError(
          result.discarded ? 'Certaines sauvegardes invalides n’ont pas été chargées.' : ''
        )
      } catch {
        setStorageError(
          'Les sauvegardes de ce navigateur ne sont pas accessibles. Le partage reste disponible.'
        )
      }
      setReady(true)
    }
    load()
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) load()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  useEffect(() => {
    setMessage('')
    setManualLink(null)
  }, [props.values])

  useEffect(() => {
    if (editingName) nameInput.current?.focus()
  }, [editingName])

  const persist = (items: SavedSimulation[]) => {
    localStorage.setItem(key, JSON.stringify(items))
    setSaved(items)
    setStorageError('')
  }

  const save = () => {
    if (!valid || !ready) return
    try {
      const latest = readSaved().simulations
      if (latest.some((item) => item.name === name && sameSimulation(item, input))) {
        setMessage('Cette simulation est déjà enregistrée dans ce navigateur.')
        return
      }
      const item: SavedSimulation = {
        ...input,
        version: 1,
        id: crypto.randomUUID(),
        name,
        customName: !!cleanSimulationName(customName),
        date: new Date().toISOString(),
      }
      persist([...latest, item])
      setMessage('Simulation enregistrée dans ce navigateur.')
    } catch {
      setStorageError(
        'Enregistrement impossible dans ce navigateur. Vérifiez que le stockage est autorisé ; vous pouvez aussi conserver le lien de partage.'
      )
    }
  }

  const remove = (item: SavedSimulation) => {
    try {
      persist(readSaved().simulations.filter((savedItem) => savedItem.id !== item.id))
      setMessage('Simulation supprimée des sauvegardes de ce navigateur.')
    } catch {
      setStorageError(
        'La suppression a échoué. Vérifiez que le stockage est autorisé dans ce navigateur.'
      )
    }
  }

  const load = (item: SavedSimulation) => {
    if (props.kind === 'mortgage' && item.kind === 'mortgage') props.onLoad(item.values)
    else if (props.kind === 'property' && item.kind === 'property') props.onLoad(item.values)
    else return
    setCustomName(item.customName ? item.name : '')
    setEditingName(false)
  }

  const share = async (snapshot: SimulationInput, title: string, custom?: string) => {
    if (sharing || !validSimulation(snapshot)) return
    const url = new URL(simulationHref(snapshot, custom), window.location.origin).href
    setSharing(true)
    setMessage('')
    setManualLink(null)
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, url })
          return
        } catch (error) {
          if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError')
            return
        }
      }
      try {
        await navigator.clipboard.writeText(url)
        setMessage('Lien copié. Il permet de retrouver tous les paramètres de cette simulation.')
      } catch {
        setManualLink({ url, name: title })
        setMessage('Copiez le lien ci-dessous pour partager cette simulation.')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <section
      data-calculator-navigation
      aria-label="Enregistrer et partager la simulation"
      className="mb-5 space-y-3 border-b pb-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-1">
          <p className="mb-0 min-w-0 truncate text-sm font-medium" title={name}>
            {name}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Personnaliser le nom"
            aria-expanded={editingName}
            aria-controls={nameId}
            onClick={() => setEditingName((value) => !value)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            disabled={!valid || !ready}
            onClick={save}
          >
            <Save className="mr-2 h-4 w-4" /> Enregistrer
          </Button>
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            disabled={!valid || sharing}
            onClick={() => share(input, name, customName)}
          >
            <Share2 className="mr-2 h-4 w-4" /> {sharing ? 'Partage…' : 'Partager'}
          </Button>
        </div>
      </div>
      {editingName && (
        <div className="space-y-2">
          <Label htmlFor={nameId}>Nom personnalisé (facultatif)</Label>
          <Input
            ref={nameInput}
            id={nameId}
            value={customName}
            placeholder={autoName}
            maxLength={100}
            className="h-11 text-base"
            onChange={(event) => setCustomName(event.target.value)}
          />
          <Button
            variant="ghost"
            className="min-h-11 whitespace-normal text-left"
            onClick={() => {
              setCustomName('')
              setEditingName(false)
            }}
          >
            Utiliser le nom automatique
          </Button>
        </div>
      )}
      <p className="mb-0 text-xs text-muted-foreground">
        Enregistrement dans ce navigateur. Le lien permet d’ouvrir la simulation sur un autre
        appareil.
      </p>
      {message && (
        <p role="status" className="mb-0 text-sm">
          {message}
        </p>
      )}
      {storageError && (
        <p role="status" className="mb-0 text-sm text-destructive">
          {storageError}
        </p>
      )}
      {manualLink && (
        <div className="space-y-2">
          <Label htmlFor={linkId} className="break-words">
            Lien de partage : {manualLink.name}
          </Label>
          <Input
            id={linkId}
            readOnly
            value={manualLink.url}
            className="h-11 text-base"
            onFocus={(event) => event.target.select()}
            onClick={(event) => event.currentTarget.select()}
          />
        </div>
      )}
      {saved.length > 0 && (
        <details>
          <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
            Mes simulations ({saved.length})
          </summary>
          <ul className="mt-2 divide-y">
            {saved.map((item) => (
              <li key={item.id} className="flex min-w-0 items-center gap-1 py-2">
                <button
                  className="min-h-11 min-w-0 flex-1 rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label={`Charger ${item.name}`}
                  onClick={() => load(item)}
                >
                  <span className="block truncate text-sm font-medium" title={item.name}>
                    {item.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {item.date.includes('T')
                      ? new Date(item.date).toLocaleDateString('fr-FR')
                      : item.date}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  aria-label={`Partager ${item.name}`}
                  disabled={sharing}
                  onClick={() => share(item, item.name, item.customName ? item.name : undefined)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  aria-label={`Supprimer ${item.name}`}
                  onClick={() => remove(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
