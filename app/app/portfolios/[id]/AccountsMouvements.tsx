import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/DatePicker'

const defaultData = {
  id: '',
  type: 'Versement',
  ticker: '',
  date: new Date(),
  quantity: 1,
  prix: 0,
}

interface AccountsMouvementsProps {
  initialData?: typeof defaultData
  Trigger: React.ComponentType<any>
  submitHandler: (data: any) => void
}

function AccountsMouvements({
  initialData = defaultData,
  Trigger,
  submitHandler,
}: AccountsMouvementsProps) {
  const [type, setType] = useState(initialData.type)
  const [date, setDate] = React.useState<Date>(initialData.date as Date)
  const [amount, setAmount] = useState<number | string>(initialData.prix || '')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Trigger />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Mouvement de Trésorerie (Cash)</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enregistrez un apport ou un retrait de liquidités pour calculer précisément votre performance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Type d'opération</Label>
            <MultiSelect active={type} select={setType} list={['Versement', 'Retrait']} />
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="date" className="text-xs font-semibold">Date</Label>
            <DatePicker date={date} setDate={setDate} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="amount" className="text-xs font-semibold">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="Ex: 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="col-span-3 h-9 text-sm font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={amount === '' || Number(amount) <= 0}
              className="w-full sm:w-auto text-xs font-bold"
              onClick={() =>
                submitHandler({
                  ...initialData,
                  type,
                  date,
                  amount: Number(amount) || 0,
                })
              }
            >
              Enregistrer l'opération
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AccountsMouvements
