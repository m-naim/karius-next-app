'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { SelectTrigger } from '@radix-ui/react-select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useEffect } from 'react'

export default function PortfolioView() {
  const id = usePathname().split('/')[3]

  return (
    <div className="flex flex-col gap-2 px-6">
      <div className="flex items-center gap-2">
        <Link href={`/app/portfolios/${id}`} className="h-fit">
          <Button variant={'ghost'}>
            <ArrowLeft />
          </Button>
        </Link>
        <h1>Importer depuis un ficher CSV</h1>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="compte">Compte</Label>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="sectionner un Compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Degiro">Degiro</SelectItem>
            <SelectItem value="Boursorama">Boursorama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="compte">Fichier</Label>
        <Input type="file"></Input>
      </div>

      <div>
        <h1>transactions</h1>

        <div>
          <h2> liste</h2>
        </div>

        <Button>Sauvegarder les Ajouts</Button>
      </div>
    </div>
  )
}
