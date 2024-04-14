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
import portfolioService from '@/services/portfolioService'
import { ComboboxPopover } from '@/components/ui/comboBox'

function TransactionDialogue({ id }) {
  const [type, setType] = useState('Acheter')
  const [ticker, setTicker] = useState<string>()
  const [date, setDate] = React.useState<Date>(new Date())
  const [quantity, setQuantity] = useState<number>(1)
  const [prix, setPrix] = useState<number>(0)

  const clickh = async () => {
    const res = await portfolioService.AddTransaction(id, {
      ticker,
      type,
      date,
      quantity,
      prix,
    })
  }

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Button variant="outline" size="sm">
            {' '}
            + Acheter/Vendre
          </Button>
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
              <Button type="submit" onClick={clickh}>
                Exécuter
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TransactionDialogue
