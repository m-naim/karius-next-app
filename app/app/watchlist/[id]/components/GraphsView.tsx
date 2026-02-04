'use client'
import React, { useState } from 'react'
import { security } from '../data/security'
import { TickerChart } from './TickerChart'

interface GraphsViewProps {
  securities: security[]
}

export function GraphsView({ securities }: GraphsViewProps) {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(
    securities.length > 0 ? securities[0].symbol : null
  )

  return (
    <div className="flex h-1/2 overflow-hidden p-4">
      <div className="flex h-1/2 max-w-sm flex-col flex-wrap gap-2">
        {securities.map((sec) => (
          <button
            key={sec.symbol}
            onClick={() => setSelectedTicker(sec.symbol)}
            className={`gap-2px-3 grid grid-cols-2 rounded-md py-1 text-sm ${
              selectedTicker === sec.symbol ? 'bg-gray-200 font-semibold' : 'bg-transparent'
            }`}
          >
            <div className="flex flex-col">
              <span>{sec.symbol}</span>
              <span>{sec.shortname}</span>
            </div>

            <div>{sec?.relativePerformances?.['6m'].toFixed(2) || 'na'}%</div>
          </button>
        ))}
      </div>
      <div className="mt-4 w-full">{selectedTicker && <TickerChart symbol={selectedTicker} />}</div>
    </div>
  )
}
