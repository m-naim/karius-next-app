import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

export interface Security {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  variations: Record<string, number>
}

interface WatchlistTableProps {
  securities: Security[]
  selectedPeriod: string
}

export function WatchlistTable({ securities, selectedPeriod }: WatchlistTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbole</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="text-right">Prix</TableHead>
            <TableHead className="text-right">Variation ({selectedPeriod})</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Cap. Marché</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {securities.map((security) => (
            <TableRow key={security.symbol} className="hover:bg-gray-50">
              <TableCell className="font-medium">{security.symbol}</TableCell>
              <TableCell>{security.name}</TableCell>
              <TableCell className="text-right">
                {security.price.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {security.variations[selectedPeriod] >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      security.variations[selectedPeriod] >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {security.variations[selectedPeriod].toFixed(2)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {security.volume.toLocaleString('fr-FR')}
              </TableCell>
              <TableCell className="text-right">
                {(security.marketCap / 1000000).toFixed(1)}M€
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
