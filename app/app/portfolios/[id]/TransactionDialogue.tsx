import React, { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import { Button } from '@/components/ui/button'
import { ComboboxPopover } from '@/components/ui/comboBox'
import { getStockPriceQuoteForDate } from '@/services/stock.service'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useDebouncedCallback } from 'use-debounce'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { AlertTriangle, RotateCcw } from 'lucide-react'

const FREE_SHARES_TYPE = 'Attribution gratuite'
const TRANSACTION_TYPES = ['Acheter', 'Vendre', FREE_SHARES_TYPE]

const defaultData = {
  id: '',
  type: 'Acheter',
  ticker: '',
  date: new Date().toISOString().split('T')[0],
  quantity: 1.0,
  prix: 0,
  freeShares: false,
}

interface TransactionData {
  id: string
  type: string
  ticker: string
  date: string
  quantity: number
  prix: number
  freeShares?: boolean
}

interface TransactionDialogueProps {
  initialData?: TransactionData
  totalPortfolioValue: number
  Trigger: React.ComponentType<any>
  submitHandler?: CallableFunction
  deleteHandler?: CallableFunction
  modifyHandler?: CallableFunction
}

function TransactionDialogue({
  initialData = defaultData,
  totalPortfolioValue = 0,
  Trigger,
  submitHandler,
  deleteHandler,
  modifyHandler,
}: TransactionDialogueProps) {
  const [open, setOpen] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [type, setType] = useState(initialData.freeShares ? FREE_SHARES_TYPE : initialData.type)
  const [ticker, setTicker] = useState<string>(initialData.ticker)
  const [date, setDate] = useState<string>(initialData.date)
  const [quantity, setQuantity] = useState<number | ''>(initialData.quantity)
  const [prix, setPrix] = useState<number | ''>(initialData.prix || '')
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceDate, setPriceDate] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const requestId = useRef(0)

  const isFreeShares = type === FREE_SHARES_TYPE

  const fetchPrice = useDebouncedCallback(async (selectedDate: string, selectedTicker: string) => {
    const currentRequestId = ++requestId.current
    setPriceLoading(true)
    setPriceError(null)
    setPriceDate(null)
    setPrix('')

    try {
      const quote = await getStockPriceQuoteForDate(selectedTicker, selectedDate)
      if (currentRequestId !== requestId.current) return

      setPrix(Number(quote.price))
      setPriceDate(quote.priceDate)
    } catch (error) {
      if (currentRequestId !== requestId.current) return
      console.error('Error fetching historical stock price:', error)
      setPriceError('Cours historique indisponible. Vous pouvez saisir un cours manuellement.')
    } finally {
      if (currentRequestId === requestId.current) setPriceLoading(false)
    }
  }, 250)

  useEffect(() => {
    if (!open) return

    const selectedTicker = ticker.trim()
    if (!date || !selectedTicker) {
      setPriceLoading(false)
      setPriceDate(null)
      setPriceError(null)
      return
    }

    fetchPrice(date, selectedTicker)
    return () => fetchPrice.cancel()
  }, [open, date, ticker, fetchPrice])

  const numericQuantity = Number(quantity)
  const numericPrice = Number(prix)
  const validDate = Boolean(date) && !Number.isNaN(new Date(date).getTime())
  const validQuantity = Number.isFinite(numericQuantity) && numericQuantity > 0
  const validPrice = Number.isFinite(numericPrice) && numericPrice > 0
  const canSave = Boolean(ticker.trim())
    && validDate
    && validQuantity
    && validPrice
    && !priceLoading
    && !executing

  const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value)
  }

  const closingAction = async (event: React.MouseEvent, callback: CallableFunction, isDelete = false) => {
    event.preventDefault()
    if (!canSave && !isDelete) return

    setExecuting(true)
    try {
      await callback()
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setExecuting(false)
    }
  }

  const transactionPayload = {
    ...initialData,
    ticker,
    type: isFreeShares ? 'Acheter' : type,
    date: format(parseISO(date), 'yyyy-MM-dd', { locale: fr }),
    quantity: numericQuantity,
    prix: numericPrice,
    freeShares: isFreeShares,
  }

  const operationTotal = isFreeShares ? 0 : numericPrice * numericQuantity

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trigger />
      </DialogTrigger>
      {open && (
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {modifyHandler ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Le cours de référence est recherché automatiquement pour la date sélectionnée.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <MultiSelect active={type} select={setType} list={TRANSACTION_TYPES} />

            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
              <Label htmlFor="transaction-symbol">Action</Label>
              <ComboboxPopover ticker={ticker} setTicker={setTicker} className="w-full sm:col-span-3" />
            </div>

            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
              <Label htmlFor="transaction-date">Date</Label>
              <Input
                id="transaction-date"
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={onDateChange}
                className="sm:col-span-3"
              />
            </div>

            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-4 sm:gap-4">
              <Label htmlFor="transaction-price" className="pt-2">
                {isFreeShares ? 'Cours de référence' : 'Prix'}
              </Label>
              <div className="space-y-1.5 sm:col-span-3">
                <Input
                  id="transaction-price"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={prix}
                  disabled={priceLoading}
                  onChange={(event) => {
                    const value = event.target.value
                    setPrix(value === '' ? '' : Number(value))
                    setPriceError(null)
                    setPriceDate(null)
                  }}
                  aria-invalid={!priceLoading && Boolean(priceError)}
                />
                {priceLoading && (
                  <p className="text-xs text-muted-foreground">Recherche du dernier cours connu…</p>
                )}
                {!priceLoading && priceDate && (
                  <p className="text-xs text-muted-foreground">
                    Cours du {format(parseISO(priceDate), 'dd/MM/yyyy', { locale: fr })}
                    {isFreeShares ? ' — aucun débit de liquidités' : ''}
                  </p>
                )}
                {!priceLoading && priceError && (
                  <p className="flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {priceError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
              <Label htmlFor="transaction-quantity">Quantité</Label>
              <Input
                id="transaction-quantity"
                value={quantity}
                onChange={(event) => {
                  const value = event.target.value
                  setQuantity(value === '' ? '' : Number(value))
                }}
                type="number"
                min="0"
                step="0.0001"
                className="sm:col-span-3"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-wrap justify-end gap-2">
            {executing ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement en cours…
              </div>
            ) : (
              <>
                {deleteHandler && (
                  <Button
                    variant="outline"
                    onClick={(event) => closingAction(event, () => deleteHandler(initialData.id), true)}
                  >
                    Supprimer
                  </Button>
                )}
                {modifyHandler && (
                  <Button
                    disabled={!canSave}
                    onClick={(event) => closingAction(event, () => modifyHandler(transactionPayload))}
                  >
                    Enregistrer les modifications
                  </Button>
                )}
                {submitHandler && (
                  <Button
                    disabled={!canSave}
                    className="text-xs font-bold"
                    onClick={(event) => closingAction(event, () => submitHandler(transactionPayload))}
                  >
                    Enregistrer la transaction
                  </Button>
                )}
              </>
            )}
          </DialogFooter>

          <div className="max-w-xs space-y-1">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-3 text-xs font-medium">
                {isFreeShares ? 'Débit de l’opération' : 'Total de l’opération'}
              </div>
              <VariationContainer
                value={operationTotal}
                background={false}
                vaiationColor={false}
                sign={false}
                entity="€"
              />
            </div>
            {totalPortfolioValue != null && totalPortfolioValue !== 0 && !isFreeShares && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-3 text-xs font-medium">Poids dans le portefeuille</div>
                <VariationContainer
                  value={operationTotal / totalPortfolioValue}
                  background={false}
                  vaiationColor={false}
                  sign={false}
                />
              </div>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default TransactionDialogue
