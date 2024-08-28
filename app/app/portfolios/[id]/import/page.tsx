'use client'

import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { distinct } from '@/lib/arrays'
import { csvToArray } from '@/lib/csv'
import { getProductsSymbols } from '@/services/stock.service'
import { SelectTrigger } from '@radix-ui/react-select'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { format, parse } from 'date-fns'
import { addTransactions } from '@/services/portfolioService'
import { Transactions } from './transactions'
import { ComboboxPopover } from '@/components/ui/comboBox'
import Loader from '@/components/molecules/loader/loader'

const exemple = []

interface transaction {
  id: string
  productName: string
  type: string
  date: string
  qty: number
  price: number
  symbol: string
}

export default function PortfolioView() {
  const id = usePathname().split('/')[3]
  const [transactions, setTransactions] = useState<transaction[]>(exemple)

  const [ticker, setTicker] = useState<string>('')

  const [fileLoaded, setFileLoaded] = useState<boolean>(false)
  const [symbolValidation, setSymbolValidation] = useState<boolean>(false)
  const fileReader = new FileReader()
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(false)

  const content = {
    loading: true,
  }

  const handleFile = (event) => {
    setLoading(true)
    const file = event.target.files[0]
    fileReader.onloadend = handleFileRead
    fileReader.readAsText(file)
    setLoading(false)
  }

  const handleFileRead = async (e) => {
    content.loading = true
    const contentFile = csvToArray(fileReader.result, ',').filter((p) => p['Code ISIN'] != null)

    const products = contentFile.map((p) => ({
      stockName: p.Produit,
      isin: p['Code ISIN'],
    }))

    const distinctProducts = distinct(products, 'isin')
    const symbols = await getProductsSymbols({ stockNames: distinctProducts })

    const extractedTransactions = contentFile.map((line) => ({
      id: line['ID Ordre'],
      productName: line.Produit,
      type: 'Acheter',
      date: format(parse(line.Date.trim(), 'dd-MM-yyyy', new Date()), 'yyyy-MM-dd'),
      qty: line.Quantité,
      price: line.Cours,
      symbol: symbols.find((s) => s.isin === line['Code ISIN']).symbol,
    }))
    setTransactions(extractedTransactions)
    setFileLoaded(true)
  }

  const containTransactionWithoutSymbol = () => {
    return transactions.filter(noExistingSymbol).length > 0
  }

  const dumpTransactions = async () => {
    try {
      setLoading(true)
      await addTransactions(id, transactions)
      router.back()
      setLoading(false)
    } catch (e) {
      console.error('error dumping ...', e)
    }
  }

  const noExistingSymbol = (t) => t.symbol == null || t.symbol.trim() === ''

  const handleRemovalByProduct = (productName) => {
    setTransactions(transactions.filter((t) => t.productName !== productName))
  }

  function replaceSymbolForProduct(productName: string) {
    const newTransactions = transactions.map((transaction) => {
      if (transaction.productName === productName) {
        transaction.symbol = ticker
        return transaction
      }
      return transaction
    })
    setTransactions(newTransactions)
    setTicker('')
  }

  return loading ? (
    <Loader />
  ) : (
    <SectionContainer>
      <div className="flex items-center gap-2">
        <Link href={`/app/portfolios/${id}`} className="h-fit">
          <Button variant={'ghost'}>
            <ArrowLeft />
          </Button>
        </Link>
        <h1>Importer depuis un ficher CSV</h1>
      </div>

      <div className="flex flex-col content-center items-center gap-2 px-6">
        {!fileLoaded && (
          <div className="w-full py-6">
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
              <Input type="file" accept=".csv" onChange={handleFile}></Input>
            </div>
          </div>
        )}

        {transactions.filter(noExistingSymbol).length > 0 && !symbolValidation && (
          <div className='py-6" w-full'>
            <p>
              Les produit suivants n'ont pas été trouver: cherchez les manuellement ou supprimer les
              transactions liés
            </p>

            <div className="flex content-center items-center justify-center p-12">
              <Button onClick={() => setSymbolValidation(true)}>Sauvegarder les Symbol</Button>
            </div>

            <div>
              {transactions
                .filter(
                  (transaction, i, arr) =>
                    arr.findIndex((t) => t.productName === transaction.productName) === i
                )
                .map((t) => (
                  <div key={t.symbol} className="grid w-full grid-cols-4 gap-4 py-1">
                    <span>{t.symbol}</span>
                    <span className="texte-xl font-semibold  text-black">{t.productName}</span>

                    <ComboboxPopover ticker={ticker} setTicker={setTicker} />

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Button onClick={() => replaceSymbolForProduct(t.productName)}>
                        Valider
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRemovalByProduct(t.productName)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {transactions.length > 0 && transactions.filter(noExistingSymbol).length == 0 && (
          <>
            <Transactions id={id} transactionState={[transactions, setTransactions]} />
            <div className="flex content-center items-center justify-center p-12">
              <Button onClick={dumpTransactions}>Sauvegarder les Ajouts</Button>
            </div>
          </>
        )}
      </div>
    </SectionContainer>
  )
}
