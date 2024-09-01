import React, { useState } from 'react'
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
import { DialogClose } from '@radix-ui/react-dialog'
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
  Trigger: React.FunctionComponent
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

  if (date == null || Number.isNaN(date.valueOf())) {
    console.log('date problem', date, initialData.date)
  }

  const onDataChange = useDebouncedCallback(async (date, ticker) => {
    const price = await getStockPrixForDate(ticker, format(date, 'yyyy-MM-dd', { locale: fr }))
    setPrix(price.close)
  }, 300)

  const updatePriceOnChange = (setter) => {
    if (date && ticker) {
      onDataChange(date, ticker)
    }
    return setter
  }

  const onDateChange = (e) => {
    const date = e.target.value
    updatePriceOnChange(setDate)(date)
  }

  const closingAction = async (e, callback) => {
    e.preventDefault()
    setExecuting(true)
    const res = await callback()
    console.log('res closingAction', res)
    setExecuting(false)
    setOpen(false)
  }

  return date ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Trigger />
      </DialogTrigger>
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
              setTicker={updatePriceOnChange(setTicker)}
              className="col-span-3 w-full"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date">Date</Label>
            <div className="col-span-3 flex">
              <Input
                id="date"
                type="date"
                defaultValue={'01-01-2022'}
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
                  onClick={async (e) => await closingAction(e, () => deleteHandler(initialData.id))}
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
    </Dialog>
  ) : null
}

export default TransactionDialogue
