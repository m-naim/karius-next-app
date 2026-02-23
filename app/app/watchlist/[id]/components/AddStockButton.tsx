'use client'

import * as React from 'react'
import { StockSearchCommand } from '@/components/ui/comboBox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AddStockButton({ addRow }) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (ticker) => {
    addRow(ticker)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Ajouter une valeur</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-[425px]">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>Ajouter une valeur à la watchlist</DialogTitle>
        </DialogHeader>
        <div className="px-2 pb-2">
          <StockSearchCommand onSelect={handleSelect} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
