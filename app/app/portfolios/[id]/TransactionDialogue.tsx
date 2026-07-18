import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
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
import { getStockPrixForDate, update } from '@/services/stock.service'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useDebouncedCallback } from 'use-debounce'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { RotateCcw } from 'lucide-react'

const defaultData = {
  id: '',
  type: 'Acheter',
  ticker: '',
  date: new Date().toISOString().split('T')[0],
  quantity: 1.0,
  prix: 0,
}

interface data {
  id: string
  type: string
  ticker: string
  date: string
  quantity: number
  prix: number
}

interface TransactionDialogueProps {
  initialData?: data
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
  const [open, setOpen] = React.useState(false)
  const [executing, setExecuting] = React.useState(false)

  const [type, setType] = useState(initialData.type)
  const [ticker, setTicker] = useState<string>(initialData.ticker)
  const [date, setDate] = React.useState<string>(initialData.date)
  const [quantity, setQuantity] = useState<number>(initialData.quantity)
  const [prix, setPrix] = useState<number>(initialData.prix)

  const fetchPrice = useDebouncedCallback(async (d, t) => {
    try {
      const price = await getStockPrixForDate(t, format(new Date(d), 'yyyy-MM-dd', { locale: fr }))
      if (price && price.close) {
        setPrix(price.close)
      }
    } catch (e) {
      console.error('Error fetching price:', e)
    }
  }, 500)

  useEffect(() => {
    if (date && ticker && ticker !== initialData.ticker) {
      fetchPrice(date, ticker)
    }
  }, [date, ticker])

  const onDateChange = (e) => {
    setDate(e.target.value)
  }

  const closingAction = async (e, callback) => {
    e.preventDefault()
    setExecuting(true)
    try {
      await callback()
      setOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setExecuting(false)
    }
  }

  return date ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trigger />
      </DialogTrigger>
      {open && (
        <DialogContent className=" dark:bg-black">
          <DialogHeader>
            <DialogTitle>Acheter / Vendre</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <MultiSelect active={type} select={setType} list={['Acheter', 'Vendre']} />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Action</Label>
              <ComboboxPopover
                ticker={ticker}
                setTicker={setTicker}
                className="col-span-3 w-full"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date">Date</Label>
              <div className="col-span-3 flex">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={onDateChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prix">Prix</Label>
              <Input
                id="prix"
                value={prix}
                onChange={(e) => setPrix(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prix">Quantité</Label>
              <Input
                id="prix"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                type="number"
                className="col-span-3"
                step={0.01}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-4">
            {executing ? (
              <div>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Execution en cours ...
              </div>
            ) : (
              <>
                {deleteHandler && (
                  <Button
                    variant="outline"
                    onClick={async (e) =>
                      await closingAction(e, () => deleteHandler(initialData.id))
                    }
                  >
                    Supprimer
                  </Button>
                )}
                {modifyHandler && (
                  <Button
                    onClick={async (e) =>
                      await closingAction(e, () =>
                        modifyHandler({
                          ...initialData,
                          ticker,
                          type,
                          date: format(parseISO(date), 'yyyy-MM-dd', { locale: fr }),
                          quantity,
                          prix,
                        })
                      )
                    }
                  >
                    Modifier
                  </Button>
                )}
                {submitHandler && (
                  <Button
                    onClick={async (e) =>
                      await closingAction(e, () =>
                        submitHandler({
                          ...initialData,
                          ticker,
                          type,
                          date: format(parseISO(date), 'yyyy-MM-dd', { locale: fr }),
                          quantity,
                          prix,
                        })
                      )
                    }
                  >
                    Exécuter
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
          <div className="max-w-xs">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-3 text-xs font-medium">Total de l'opération</div>
              <VariationContainer
                value={prix * quantity}
                background={false}
                vaiationColor={false}
                sign={false}
                entity="€"
              />
            </div>
            {totalPortfolioValue != null && totalPortfolioValue != 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-3 text-xs font-medium">Poids dans le portefeuille</div>
                <VariationContainer
                  value={(prix * quantity) / totalPortfolioValue}
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
  ) : null
}

export default TransactionDialogue
