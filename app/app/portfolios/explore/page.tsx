'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getPublicPortfolios } from '@/services/portfolioService'
import { Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Users, TrendingUp } from 'lucide-react'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from '@/lib/utils'

interface PortfolioSummery {
  id: string
  name: string
  followersSize: number
  dayChangePercent: number
  cumulativePerformance: number
  allocation: string[]
  annualizedReturn: number
}

interface PagedResponse {
  content: PortfolioSummery[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export default function ExplorePortfoliosPage() {
  const [data, setData] = useState<PagedResponse | null>(null)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(15)
  const [sortBy, setSortBy] = useState('annualized_return')
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPortfolios = async () => {
    setLoading(true)
    try {
      const res = await getPublicPortfolios(page, limit, sortBy, direction)
      setData(res)
    } catch (error) {
      console.error('Error fetching public portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolios()
  }, [page, limit, sortBy, direction])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(column)
      setDirection('DESC')
    }
    setPage(0)
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown size={12} className="ml-1 opacity-30" />
    return direction === 'ASC' ? <ArrowUp size={12} className="ml-1 text-primary" /> : <ArrowDown size={12} className="ml-1 text-primary" />
  }

  const filteredContent = data?.content?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <SectionContainer className="py-8 space-y-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Découvrir les <span className="text-primary">Stratégies</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-gray-500">
          Analysez les performances et la composition des meilleurs portefeuilles publics de la communauté.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrer par nom..."
            className="pl-9 h-9 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-gray-500">
            <span className="text-primary">{data?.totalElements || 0}</span>
            <span>Portefeuilles</span>
          </div>
          <select 
            value={limit} 
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(0); }}
            className="bg-transparent border rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-primary transition-colors"
          >
            <option value={15}>15 par page</option>
            <option value={30}>30 par page</option>
            <option value={50}>50 par page</option>
          </select>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden rounded-3xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest py-4"
                onClick={() => handleSort('name')}
              >
                Nom du Portefeuille <SortIcon column="name" />
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest"
                onClick={() => handleSort('followers_size')}
              >
                Abonnés <SortIcon column="followers_size" />
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest"
                onClick={() => handleSort('annualized_return')}
              >
                Perf. Annuelle <SortIcon column="annualized_return" />
              </TableHead>
              <TableHead className="text-center font-black text-[10px] uppercase tracking-widest">
                Allocation Type
              </TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(limit)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/20" />
                </TableRow>
              ))
            ) : filteredContent.length > 0 ? (
                filteredContent.map((p) => (
              <TableRow key={p.id} className="group hover:bg-primary/[0.02] transition-colors">
                <TableCell className="font-bold py-4">
                  <Link href={`/app/portfolios/${p.id}`} className="hover:text-primary transition-colors flex flex-col">
                    <span>{p.name}</span>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tight">Public Portfolio</span>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 text-xs font-bold text-gray-600">
                    <Users size={12} className="text-gray-400" />
                    {p.followersSize || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <VariationContainer
                    value={p.annualizedReturn}
                    entity="%"
                    background={true}
                    className="inline-flex m-0 px-3 py-1 font-black text-xs"
                  />
                </TableCell>
                <TableCell>
                   <div className="flex justify-center gap-1">
                    {p.allocation?.slice(0, 3).map((symbol) => (
                      <span key={symbol} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                        {symbol}
                      </span>
                    ))}
                    {p.allocation?.length > 3 && (
                      <span className="text-[9px] font-bold text-gray-400">+{p.allocation.length - 3}</span>
                    )}
                   </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button asChild variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <Link href={`/app/portfolios/${p.id}`}><TrendingUp size={14} /></Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-400 italic">
                        Aucun portefeuille trouvé
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-2">
          <p className="text-xs text-gray-500 font-medium">
            Page <span className="text-gray-900 font-bold">{page + 1}</span> sur <span className="text-gray-900 font-bold">{data.totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4 font-bold border-2"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              <ChevronLeft size={16} className="mr-1" /> Précédent
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(data.totalPages)].map((_, i) => {
                // Logic to show only some page numbers if totalPages is large
                if (
                  i === 0 || 
                  i === data.totalPages - 1 || 
                  (i >= page - 1 && i <= page + 1)
                ) {
                  return (
                    <Button
                      key={i}
                      variant={page === i ? "default" : "ghost"}
                      size="sm"
                      className={cn("h-9 w-9 rounded-xl font-bold", page === i ? "shadow-lg shadow-primary/20" : "")}
                      onClick={() => setPage(i)}
                      disabled={loading}
                    >
                      {i + 1}
                    </Button>
                  )
                } else if (i === page - 2 || i === page + 2) {
                  return <span key={i} className="text-gray-300">...</span>
                }
                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4 font-bold border-2"
              onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
              disabled={page >= data.totalPages - 1 || loading}
            >
              Suivant <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </SectionContainer>
  )
}
