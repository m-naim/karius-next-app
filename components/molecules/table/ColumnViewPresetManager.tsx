'use client'

import * as React from 'react'
import { Table } from '@tanstack/react-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  saveColumnVisibility,
  saveColumnOrder,
  ACTIVE_PRESET_KEY,
} from '@/lib/column-persistence'
import {
  ChevronDown,
  Columns,
  GripVertical,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Search,
  Save,
  CheckCircle2,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

export interface ColumnViewPreset {
  id: string
  name: string
  description?: string
  icon?: string
  isSystem?: boolean
  columns: Record<string, boolean>
  order?: string[]
}

export const ALL_COLUMNS_CONFIG: { id: string; label: string; group: string; description: string }[] = [
  {
    id: 'symbol',
    label: 'Actif / Symbole',
    group: 'Général',
    description: 'Ticker boursier et nom officiel de la société ou de l’indice.',
  },
  {
    id: 'regularMarketPrice',
    label: 'Prix Actuel',
    group: 'Général',
    description: 'Dernier cours de bourse coté en temps réel (ou à la clôture) dans la devise de cotation.',
  },
  {
    id: 'variation',
    label: 'Variation (%)',
    group: 'Général',
    description: 'Performance du cours de bourse sur la période temporelle sélectionnée (1j, 1w, 1m, 1y, 5y).',
  },
  {
    id: 'sector',
    label: 'Secteur',
    group: 'Général',
    description: 'Secteur d’activité macro-économique global (ex: Technologie, Santé, Consommation).',
  },
  {
    id: 'industry',
    label: 'Industrie',
    group: 'Général',
    description: 'Secteur industriel spécifique et détaillé au sein de la société.',
  },
  {
    id: 'marketCap',
    label: 'Capitalisation Boursière',
    group: 'Général',
    description: 'Valeur de marché totale des actions en circulation (Prix × Nombre d’actions).',
  },
  {
    id: 'weight',
    label: 'Pondération (%)',
    group: 'Général',
    description: 'Poids relatif en pourcentage de la valeur au sein de l’indice ou du portefeuille.',
  },
  {
    id: 'tags',
    label: 'Tags',
    group: 'Général',
    description: 'Étiquettes personnalisées utilisateur associées à la valeur (ex: Core, Value, Watch).',
  },
  {
    id: 'hasFundamentals',
    label: 'Fondamentaux Dispos',
    group: 'Général',
    description: 'Indique si les données et états financiers historiques complets sont disponibles.',
  },

  {
    id: 'trailingPE',
    label: 'P/E (12m)',
    group: 'Valuation',
    description: 'PER historique : Prix rapporté aux bénéfices nets par action des 12 derniers mois (TTM).',
  },
  {
    id: 'forwardPE',
    label: 'P/E Fwd',
    group: 'Valuation',
    description: 'PER estimé : Prix rapporté aux bénéfices futurs attendus par les analystes à 12 mois.',
  },
  {
    id: 'pe5y',
    label: 'P/E (5a proxy)',
    group: 'Valuation',
    description: 'PER lissé sur 5 ans : Prix rapporté à la moyenne des bénéfices nets des 5 derniers exercices.',
  },
  {
    id: 'dividendYield',
    label: 'Rendement Div. (%)',
    group: 'Valuation',
    description: 'Rendement du dividende brut annuel rapporté au cours actuel de l’action.',
  },

  {
    id: 'roe',
    label: 'ROE (%)',
    group: 'Rentabilité',
    description: 'Rentabilité des capitaux propres (Return on Equity). Un ROE > 15-20% traduit un fort Moat.',
  },
  {
    id: 'roa',
    label: 'ROA (%)',
    group: 'Rentabilité',
    description: 'Rentabilité des actifs totaux (Return on Assets). Efficacité à rentabiliser ses actifs.',
  },
  {
    id: 'roic',
    label: 'ROIC (5a) (%)',
    group: 'Rentabilité',
    description: 'Rentabilité moyenne du capital investi sur 5 ans. Mesure clé d’allocation de capital (François Rochon).',
  },

  {
    id: 'growth',
    label: 'Croissance CA (1a)',
    group: 'Croissance',
    description: 'Taux de croissance du chiffre d’affaires sur le dernier exercice annuel.',
  },
  {
    id: 'revGrowth',
    label: 'Croissance CA (5a)',
    group: 'Croissance',
    description: 'Taux de croissance annuel moyen du chiffre d’affaires sur les 5 dernières années.',
  },
  {
    id: 'cagr5y',
    label: 'TCAC 5a (%)',
    group: 'Croissance',
    description: 'Taux de Croissance Annuel Composé (CAGR) du cours de l’action sur 5 ans.',
  },
  {
    id: 'cagr10y',
    label: 'TCAC 10a (%)',
    group: 'Croissance',
    description: 'Taux de Croissance Annuel Composé (CAGR) du cours de l’action sur 10 ans.',
  },

  {
    id: 'linearity10y',
    label: 'Linéarité (10a) (%)',
    group: 'Qualité & Score',
    description: 'Régularité et constance de la hausse du cours sur 10 ans (score R² de régression logarithmique).',
  },
  {
    id: 'ret_lin',
    label: 'Score (Ret×Lin) (%)',
    group: 'Qualité & Score',
    description: 'Score composite Horus combinant la performance annuelle moyenne et la linéarité du cours.',
  },
  {
    id: 'relativePerformances',
    label: 'Perf. Relative',
    group: 'Qualité & Score',
    description: 'Performance de l’action comparée à son indice de référence (Benchmark) sur la période.',
  },
]

export const SYSTEM_VIEW_PRESETS: ColumnViewPreset[] = [
  {
    id: 'standard',
    name: 'Standard / Synthèse',
    description: 'Vue principale équilibrée (Prix, Variation, Secteur, P/E, Yield, Cap)',
    icon: '⚡',
    isSystem: true,
    columns: {
      actions: true,
      symbol: true,
      regularMarketPrice: true,
      variation: true,
      sector: true,
      trailingPE: true,
      dividendYield: true,
      growth: true,
      tags: true,
      marketCap: true,
      weight: true,
    },
    order: [
      'symbol',
      'regularMarketPrice',
      'variation',
      'sector',
      'trailingPE',
      'dividendYield',
      'growth',
      'marketCap',
      'weight',
      'tags',
      'actions',
    ],
  },
  {
    id: 'metrics5a',
    name: 'Metrics 5A',
    description: 'Focus historique 5 ans (ROIC 5a, P/E moyen, Croissance CA 5a)',
    icon: '📊',
    isSystem: true,
    columns: {
      actions: true,
      symbol: true,
      regularMarketPrice: true,
      variation: true,
      revGrowth: true,
      roic: true,
      pe5y: true,
      forwardPE: true,
      tags: true,
    },
    order: [
      'symbol',
      'regularMarketPrice',
      'variation',
      'revGrowth',
      'roic',
      'pe5y',
      'forwardPE',
      'tags',
      'actions',
    ],
  },
  {
    id: 'quality',
    name: 'Qualité & Moat',
    description: 'Rentabilité du capital (ROE, ROA, ROIC) et régularité (Linéarité 10a)',
    icon: '💎',
    isSystem: true,
    columns: {
      actions: true,
      symbol: true,
      regularMarketPrice: true,
      roe: true,
      roa: true,
      roic: true,
      linearity10y: true,
      ret_lin: true,
      tags: true,
    },
    order: [
      'symbol',
      'regularMarketPrice',
      'roe',
      'roa',
      'roic',
      'linearity10y',
      'ret_lin',
      'tags',
      'actions',
    ],
  },
  {
    id: 'valuation',
    name: 'Valuation & Rendement',
    description: 'Multiples de valorisation complets (PE, PE Fwd, PE 5a, Dividende)',
    icon: '💰',
    isSystem: true,
    columns: {
      actions: true,
      symbol: true,
      regularMarketPrice: true,
      trailingPE: true,
      forwardPE: true,
      pe5y: true,
      dividendYield: true,
      cagr5y: true,
      marketCap: true,
      tags: true,
    },
    order: [
      'symbol',
      'regularMarketPrice',
      'trailingPE',
      'forwardPE',
      'pe5y',
      'dividendYield',
      'cagr5y',
      'marketCap',
      'tags',
      'actions',
    ],
  },
  {
    id: 'all',
    name: 'Toutes les Colonnes',
    description: 'Affichage exhaustif de toutes les métriques disponibles',
    icon: '👁️',
    isSystem: true,
    columns: ALL_COLUMNS_CONFIG.reduce(
      (acc, col) => ({ ...acc, [col.id]: true }),
      { actions: true }
    ),
    order: ['symbol', ...ALL_COLUMNS_CONFIG.map((c) => c.id).filter((id) => id !== 'symbol'), 'actions'],
  },
]

const CUSTOM_PRESETS_STORAGE_KEY = 'boursehorus_custom_column_presets_v2'

interface ColumnViewPresetManagerProps {
  table: Table<any>
}

export function ColumnViewPresetManager({ table }: ColumnViewPresetManagerProps) {
  const [open, setOpen] = React.useState(false)
  const [customPresets, setCustomPresets] = React.useState<ColumnViewPreset[]>([])
  const [activePresetId, setActivePresetId] = React.useState<string>('standard')
  const [addSearchTerm, setAddSearchTerm] = React.useState('')
  const [newPresetName, setNewPresetName] = React.useState('')
  const [isCreatingNew, setIsCreatingNew] = React.useState(false)

  // Drag & Drop states
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  // Load custom presets & active preset on mount
  React.useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY)
      if (savedCustom) {
        setCustomPresets(JSON.parse(savedCustom))
      }
      const savedActive = localStorage.getItem(ACTIVE_PRESET_KEY)
      if (savedActive) {
        setActivePresetId(savedActive)
      }
    } catch (e) {
      console.error('Error loading custom column presets', e)
    }
  }, [])

  const allPresets = React.useMemo(() => {
    return [...SYSTEM_VIEW_PRESETS, ...customPresets]
  }, [customPresets])

  const activePreset = React.useMemo(() => {
    return allPresets.find((p) => p.id === activePresetId) || SYSTEM_VIEW_PRESETS[0]
  }, [allPresets, activePresetId])

  // Helper to get human label
  const getColumnLabel = (colId: string) => {
    const found = ALL_COLUMNS_CONFIG.find((c) => c.id === colId)
    if (found) return found.label
    if (colId === 'symbol') return 'Actif / Symbole'
    if (colId === 'actions') return 'Actions'
    return colId
  }

  const getColumnGroup = (colId: string) => {
    const found = ALL_COLUMNS_CONFIG.find((c) => c.id === colId)
    return found?.group || 'Général'
  }

  const getColumnDescription = (colId: string) => {
    const found = ALL_COLUMNS_CONFIG.find((c) => c.id === colId)
    return found?.description || ''
  }

  // Get current visible column IDs in exact display order
  const visibleColumnIds = React.useMemo(() => {
    const currentOrder = table.getState().columnOrder
    const allTableCols = table.getAllColumns()

    let orderedColIds: string[]
    if (currentOrder && currentOrder.length > 0) {
      orderedColIds = currentOrder
    } else {
      orderedColIds = allTableCols.map((c) => c.id)
    }

    // Filter to only hideable & visible columns (or symbol/actions if needed)
    return orderedColIds.filter((colId) => {
      const col = table.getColumn(colId)
      return col ? col.getIsVisible() : false
    })
  }, [table, table.getState().columnVisibility, table.getState().columnOrder])

  // Get list of hidden available columns
  const hiddenColumns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter((col) => col.getCanHide() && !col.getIsVisible())
      .filter((col) => {
        if (!addSearchTerm.trim()) return true
        const label = getColumnLabel(col.id).toLowerCase()
        const id = col.id.toLowerCase()
        return (
          label.includes(addSearchTerm.toLowerCase()) ||
          id.includes(addSearchTerm.toLowerCase())
        )
      })
  }, [table, table.getState().columnVisibility, addSearchTerm])

  // Function to apply column order and visibility to TanStack Table
  const updateTableColumnLayout = React.useCallback(
    (newVisibleIds: string[]) => {
      const allTableCols = table.getAllColumns().map((c) => c.id)
      const hiddenIds = allTableCols.filter((id) => !newVisibleIds.includes(id))
      const fullOrder = [...newVisibleIds, ...hiddenIds]

      // Set visibility map
      const visMap: Record<string, boolean> = {}
      allTableCols.forEach((id) => {
        visMap[id] = newVisibleIds.includes(id)
      })

      table.setColumnVisibility(visMap)
      table.setColumnOrder(fullOrder)
      saveColumnVisibility(visMap)
      saveColumnOrder(fullOrder)
    },
    [table]
  )

  // Apply a preset to the table
  const applyPreset = React.useCallback(
    (preset: ColumnViewPreset) => {
      setActivePresetId(preset.id)
      try {
        localStorage.setItem(ACTIVE_PRESET_KEY, preset.id)
      } catch (e) {
        console.error(e)
      }

      // Build visibility map
      const visibility: Record<string, boolean> = {}
      table.getAllColumns().forEach((col) => {
        if (col.getCanHide()) {
          visibility[col.id] = !!preset.columns[col.id]
        }
      })
      table.setColumnVisibility(visibility)

      let fullOrder: string[]
      if (preset.order && preset.order.length > 0) {
        const rest = table.getAllColumns().map((c) => c.id).filter((id) => !preset.order!.includes(id))
        fullOrder = [...preset.order, ...rest]
      } else {
        const defaultOrder = Object.keys(preset.columns).filter((id) => preset.columns[id])
        const restCols = table.getAllColumns().map((c) => c.id).filter((id) => !defaultOrder.includes(id))
        fullOrder = [...defaultOrder, ...restCols]
      }
      table.setColumnOrder(fullOrder)
      saveColumnVisibility(visibility)
      saveColumnOrder(fullOrder)
    },
    [table]
  )

  // Remove column from active view
  const handleRemoveColumn = (colId: string) => {
    const updatedVisible = visibleColumnIds.filter((id) => id !== colId)
    updateTableColumnLayout(updatedVisible)
  }

  // Add column to active view
  const handleAddColumn = (colId: string) => {
    const updatedVisible = [...visibleColumnIds, colId]
    updateTableColumnLayout(updatedVisible)
  }

  // HTML5 Drag & Drop handlers for column reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const updatedVisible = [...visibleColumnIds]
    const [draggedItem] = updatedVisible.splice(draggedIndex, 1)
    updatedVisible.splice(targetIndex, 0, draggedItem)

    updateTableColumnLayout(updatedVisible)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Up / Down button move fallback
  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const updated = [...visibleColumnIds]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    updateTableColumnLayout(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index >= visibleColumnIds.length - 1) return
    const updated = [...visibleColumnIds]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    updateTableColumnLayout(updated)
  }

  // Save active custom preset
  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return

    const visMap: Record<string, boolean> = {}
    table.getAllColumns().forEach((col) => {
      visMap[col.id] = col.getIsVisible()
    })

    const newPreset: ColumnViewPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Vue sur-mesure enregistrée',
      icon: '⭐',
      isSystem: false,
      columns: visMap,
      order: visibleColumnIds,
    }

    const updated = [...customPresets, newPreset]
    setCustomPresets(updated)
    try {
      localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }

    applyPreset(newPreset)
    setNewPresetName('')
    setIsCreatingNew(false)
  }

  // Overwrite existing custom preset with current layout
  const handleOverwriteCurrentCustomPreset = () => {
    if (activePreset.isSystem) return

    const visMap: Record<string, boolean> = {}
    table.getAllColumns().forEach((col) => {
      visMap[col.id] = col.getIsVisible()
    })

    const updatedPresets = customPresets.map((p) => {
      if (p.id === activePreset.id) {
        return {
          ...p,
          columns: visMap,
          order: visibleColumnIds,
        }
      }
      return p
    })

    setCustomPresets(updatedPresets)
    try {
      localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets))
    } catch (e) {
      console.error(e)
    }
  }

  // Delete custom preset
  const handleDeleteCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = customPresets.filter((p) => p.id !== presetId)
    setCustomPresets(updated)
    try {
      localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error(err)
    }
    if (activePresetId === presetId) {
      applyPreset(SYSTEM_VIEW_PRESETS[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full border-border/70 text-xs font-bold transition-all hover:bg-muted hover:text-foreground"
          title="Gérer les vues et l'affichage des colonnes"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-primary" />
          <span className="truncate max-w-[130px] sm:max-w-[180px]">
            {activePreset ? activePreset.name : 'Vues'}
          </span>
          <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-extrabold">
            {visibleColumnIds.length} col.
          </Badge>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border/70 shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Columns className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Gestionnaire de Vues & Colonnes
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Glissez-déposez les colonnes pour réordonner, supprimez avec '×' ou cherchez des métriques à ajouter.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="columns" className="flex-1 flex flex-col min-h-0">
          <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-border/40 bg-card shrink-0">
            <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="columns" className="text-xs font-bold gap-1.5 rounded-md">
                <Columns className="h-3.5 w-3.5 text-primary" />
                Colonnes de la Vue ({visibleColumnIds.length})
              </TabsTrigger>
              <TabsTrigger value="presets" className="text-xs font-bold gap-1.5 rounded-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Vues Prédéfinies ({allPresets.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: COLONNES & REORDERNEMENT (DRAG & DROP) */}
          <TabsContent value="columns" className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto space-y-4 m-0">
            {/* SECTION 1: COLONNES ACTIVES (DRAG & DROP) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GripVertical className="h-3.5 w-3.5 text-primary" /> Colonnes Actives (Glisser-Déposer pour réordonner)
                </span>
                {!activePreset.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOverwriteCurrentCustomPreset}
                    className="h-6 gap-1 text-[10px] font-bold text-amber-600 border-amber-500/40 hover:bg-amber-500/10"
                  >
                    <Save className="h-3 w-3" />
                    <span>Mettre à jour "{activePreset.name}"</span>
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {visibleColumnIds.map((colId, index) => {
                  const label = getColumnLabel(colId)
                  const group = getColumnGroup(colId)
                  const description = getColumnDescription(colId)
                  const isDragging = draggedIndex === index
                  const isDragOver = dragOverIndex === index

                  return (
                    <div
                      key={colId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={() => {
                        setDraggedIndex(null)
                        setDragOverIndex(null)
                      }}
                      className={cn(
                        'group flex items-center justify-between px-3 py-2 rounded-xl border bg-card text-xs transition-all cursor-grab active:cursor-grabbing select-none',
                        isDragging && 'opacity-40 border-primary border-dashed bg-primary/5',
                        isDragOver && 'border-primary ring-2 ring-primary/20 scale-[1.01]',
                        !isDragging && !isDragOver && 'border-border/70 hover:border-border hover:bg-muted/30 shadow-2xs'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <div
                          title="Glisser pour réordonner"
                          className="p-1 rounded text-muted-foreground/60 group-hover:text-foreground group-hover:bg-muted transition-colors cursor-grab active:cursor-grabbing shrink-0"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>

                        <div className="flex flex-col min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground truncate">{label}</span>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 font-normal text-muted-foreground shrink-0"
                            >
                              {group}
                            </Badge>
                          </div>
                          {description && (
                            <span className="text-[10px] text-muted-foreground/80 leading-tight truncate mt-0.5 max-w-[320px] sm:max-w-[420px]">
                              {description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Order buttons fallback */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Monter la colonne"
                            className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === visibleColumnIds.length - 1}
                            title="Descendre la colonne"
                            className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Delete / Remove Column Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(colId)}
                          title="Masquer / Retirer cette colonne"
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SECTION 2: AJOUTER DES COLONNES (RECHERCHE RAPIDE) */}
            <div className="space-y-2 pt-3 border-t border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-emerald-500" /> Ajouter des Colonnes
              </span>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Recherche rapide (ex: ROE, PE, Rendement, Linéarité)..."
                  value={addSearchTerm}
                  onChange={(e) => setAddSearchTerm(e.target.value)}
                  className="h-8 text-xs pl-8 bg-muted/20 border-border/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {hiddenColumns.length > 0 ? (
                  hiddenColumns.map((col) => {
                    const label = getColumnLabel(col.id)
                    const group = getColumnGroup(col.id)
                    const description = getColumnDescription(col.id)

                    return (
                      <div
                        key={col.id}
                        onClick={() => handleAddColumn(col.id)}
                        className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/10 hover:bg-emerald-500/10 hover:border-emerald-500/40 cursor-pointer transition-all text-xs group"
                      >
                        <div className="flex flex-col min-w-0 pr-1 overflow-hidden">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                              {label}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 font-normal text-muted-foreground shrink-0"
                            >
                              {group}
                            </Badge>
                          </div>
                          {description && (
                            <span className="text-[10px] text-muted-foreground/80 leading-tight line-clamp-1 mt-0.5">
                              {description}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-md shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-2 p-3 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                    {addSearchTerm
                      ? "Aucune colonne ne correspond à votre recherche"
                      : "Toutes les colonnes sont actuellement affichées dans cette vue"}
                  </div>
                )}
              </div>
            </div>

            {/* SAVE CUSTOM VIEW SECTION */}
            <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Input
                  placeholder="Enregistrer comme nouvelle vue custom..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
                <Button
                  size="sm"
                  onClick={handleSaveCustomPreset}
                  disabled={!newPresetName.trim()}
                  className="h-8 gap-1.5 text-xs font-bold shrink-0"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Enregistrer</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyPreset(SYSTEM_VIEW_PRESETS[0])}
                className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reinitialiser Standard
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: PRESETS MANAGER */}
          <TabsContent value="presets" className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto space-y-4 m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allPresets.map((preset) => {
                const isActive = activePresetId === preset.id
                const count = Object.values(preset.columns).filter(Boolean).length

                return (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left',
                      isActive
                        ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30'
                        : 'bg-card border-border/70 hover:border-border hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{preset.icon || '📌'}</span>
                        <div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <span>{preset.name}</span>
                            {isActive && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                          </h4>
                          {preset.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                              {preset.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {!preset.isSystem && (
                        <button
                          onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                          title="Supprimer cette vue custom"
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-[10px] font-semibold text-muted-foreground">
                      <Badge
                        variant={isActive ? 'default' : 'outline'}
                        className="text-[10px] px-2 py-0 font-bold"
                      >
                        {count} colonnes
                      </Badge>
                      {preset.isSystem ? (
                        <span className="text-muted-foreground/70">Système</span>
                      ) : (
                        <span className="text-amber-500 font-bold">Custom</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
