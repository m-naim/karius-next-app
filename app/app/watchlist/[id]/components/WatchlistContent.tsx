'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { WatchlistTable } from './WatchlistTable'
import { Security } from './WatchlistTable'
import { TableContextHeader } from './table-header'

interface WatchlistData {
  name: string
  securities: Security[]
  updatedAt: string
}

interface WatchlistContentProps {
  watchlistData: WatchlistData
}

export function WatchlistContent({ watchlistData }: WatchlistContentProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (!isValid(date)) {
        return 'Date non disponible'
      }
      return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr })
    } catch (error) {
      console.error('Erreur de formatage de la date:', error)
      return 'Date non disponible'
    }
  }

  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">{watchlistData.name}</CardTitle>
            <p className="text-sm text-gray-500">
              Mise à jour le {formatDate(watchlistData.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{watchlistData.securities.length} titres</span>
          </div>
        </CardHeader>
        <CardContent>
          <TableContextHeader
            table={null}
            id={''}
            owned={false}
            setData={() => {}}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
          <WatchlistTable securities={watchlistData.securities} selectedPeriod={selectedPeriod} />
        </CardContent>
      </Card>
    </div>
  )
}
