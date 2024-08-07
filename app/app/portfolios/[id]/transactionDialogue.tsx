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
import { DatePicker } from '@/components/ui/DatePicker'
import { DialogClose } from '@radix-ui/react-dialog'
import { ComboboxPopover } from '@/components/ui/comboBox'
import { v4 as uuidv4 } from 'uuid'
import { AddTransaction } from '@/services/portfolioService'

const DefaultTransactionTrigger = () => (
  <Button variant="outline" size="sm">
    {' '}
    + Acheter/Vendre
  </Button>
)

const defaultData = { id: '', type: 'Acheter', ticker: '', date: new Date(), quantity: 1, prix: 0 }

function TransactionDialogue({
  idPortfolio,
  initialData = defaultData,
  Trigger = DefaultTransactionTrigger,
  submitHandler = async (transactionData) => {
    transactionData.id = uuidv4()
    const res = await AddTransaction(idPortfolio, transactionData)
  },
}) {
  // console.log(initialData);

  const [type, setType] = useState(initialData.type)
  const [ticker, setTicker] = useState<string>(initialData.ticker)
  const [date, setDate] = React.useState<Date>(initialData.date)
  const [quantity, setQuantity] = useState<number>(initialData.quantity)
  const [prix, setPrix] = useState<number>(initialData.prix)

  if (Number.isNaN(date.valueOf())) {
    console.log(date, initialData.date)
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Trigger />
      </DialogTrigger>
      <DialogContent className=" dark:bg-black">
        <DialogHeader>
          <DialogTitle>Acheter/Vendre</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <MultiSelect active={type} select={setType} list={['Acheter', 'Vendre']} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name">Action</Label>
            <ComboboxPopover ticker={ticker} setTicker={setTicker} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date">Date</Label>
            <DatePicker date={date} setDate={setDate} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prix">Prix</Label>
            <Input
              id="prix"
              value={prix}
              onChange={(e) => setPrix(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prix">Quantité</Label>
            <Input
              id="prix"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              type="number"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              type="submit"
              onClick={() =>
                submitHandler({
                  ...initialData,
                  ticker,
                  type,
                  date,
                  quantity,
                  prix,
                })
              }
            >
              Exécuter
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TransactionDialogue
