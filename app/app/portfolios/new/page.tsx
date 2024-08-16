'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { add } from '@/services/portfolioService'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function AddPortfolio() {
  const [name, setName] = useState('')
  const [value, setValue] = useState('10000')
  const [visibility, setVisibility] = useState(true)

  const router = useRouter()

  const addClick = async () => {
    const res = await add({
      name,
      visibility,
    })

    router.push(`/app/portfolios/${res.data.id}`, { scroll: false })
  }

  return (
    <div className=" flex flex-col items-center justify-center  gap-6 px-12 py-12 ">
      <div className="flex flex-col gap-4 ">
        <div className="flex items-center  gap-2">
          <Link href={`/app/portfolios`} className="h-fit">
            <Button variant={'ghost'}>
              <ArrowLeft />
            </Button>
          </Link>
          <span className="text-xl font-semibold leading-7 lg:leading-9 ">
            Créer un nouveau portefeuille
          </span>
        </div>

        <div className="grid min-w-96 gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="name">Nom du portefeuille</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="col-span-3"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="prix">Valeur initial</Label>
            <Input
              id="prix"
              value={value}
              type="number"
              className="col-span-3"
              onChange={(e) => setValue(e.currentTarget.value)}
            />
          </div>

          <div className=" flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Visibilité</p>
              <p className="text-sm text-muted-foreground">
                voulez partage votre portefeuille en public?
              </p>
            </div>
            <Switch checked={visibility} onCheckedChange={(e) => setVisibility(e)} />
          </div>
        </div>

        <Button className="btn-primary" onClick={() => addClick()}>
          Ajouter
        </Button>
      </div>
    </div>
  )
}

export default AddPortfolio
