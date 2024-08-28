import React, { useEffect, useState } from 'react'
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
import { v4 as uuidv4 } from 'uuid'
import { AddTransaction } from '@/services/portfolioService'

const defaultData = {
  id: '',
  type: 'Versement',
  ticker: '',
  date: new Date(),
  quantity: 1,
  prix: 0,
}

function AccountsMouvements({ initialData = defaultData, Trigger, submitHandler }) {
  const [type, setType] = useState(initialData.type)
  const [date, setDate] = React.useState<Date>(initialData.date)
  const [amount, setAmount] = useState<number>(initialData.prix)

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
          <DialogTitle>Dépôt / retrait</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <MultiSelect active={type} select={setType} list={['Versement', 'Retrait']} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date">Date</Label>
            <DatePicker date={date} setDate={setDate} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
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
                  type,
                  date,
                  amount,
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

export default AccountsMouvements
