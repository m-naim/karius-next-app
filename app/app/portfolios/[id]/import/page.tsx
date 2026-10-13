'use client'

import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { distinct } from '@/lib/arrays'
import { csvToArray } from '@/lib/csv'
import { getProductsSymbols } from '@/services/stock.service'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { format, isValid, parse, parseISO } from 'date-fns'
import { addTransactions } from '@/services/portfolioService'
import { Transactions } from './transactions'
import { ComboboxPopover } from '@/components/ui/comboBox'
import Loader from '@/components/molecules/loader/loader'

interface transaction {
  id: string
  productName: string
  type: string
  date: string
  qty: number
  price: number
  symbol: string
  freeShares?: boolean
}

const normalizeHeader = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const getField = (row: Record<string, string>, aliases: string[]) => {
  const normalizedAliases = aliases.map(normalizeHeader)
  const entry = Object.entries(row).find(([key]) => normalizedAliases.includes(normalizeHeader(key)))
  return entry?.[1]?.trim() || ''
}

const parseCsvNumber = (value: string) => {
  const cleaned = value
    .replace(/[\u00a0\s€$£]/g, '')
    .replace(/[()]/g, (character) => (character === '(' ? '-' : ''))

  if (!cleaned) return Number.NaN

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized = cleaned

  if (lastComma !== -1 && lastDot !== -1) {
    normalized = lastComma > lastDot
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    normalized = cleaned.replace(',', '.')
  }

  const parsed = Number(normalized.replace(/[^0-9+\-.]/g, ''))
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

const parseCsvDate = (value: string) => {
  const rawValue = value.trim()
  if (!rawValue) return null

  const isoDate = parseISO(rawValue)
  if (isValid(isoDate)) return format(isoDate, 'yyyy-MM-dd')

  for (const pattern of ['dd-MM-yyyy', 'dd/MM/yyyy', 'dd.MM.yyyy', 'MM/dd/yyyy']) {
    const parsed = parse(rawValue.split(/[ T]/)[0], pattern, new Date())
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd')
  }

  const nativeDate = new Date(rawValue)
  return Number.isNaN(nativeDate.getTime()) ? null : format(nativeDate, 'yyyy-MM-dd')
}

const getTransactionType = (value: string) => {
  const normalized = normalizeHeader(value)
  if (normalized.includes('gratuit') || normalized.includes('attribution')) return 'FREE'
  if (normalized.includes('vente') || normalized.includes('sell') || normalized.includes('cession') || normalized.includes('sortie')) {
    return 'SELL'
  }
  return 'BUY'
}

export default function PortfolioView() {
  const id = usePathname().split('/')[3]
  const [transactions, setTransactions] = useState<transaction[]>([])

  const [ticker, setTicker] = useState<string>('')

  const [fileLoaded, setFileLoaded] = useState<boolean>(false)
  const router = useRouter()

  const [loading, setLoading] = useState<boolean>(false)
  const [account, setAccount] = useState('Degiro')
  const [importError, setImportError] = useState<string | null>(null)

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    setLoading(true)
    setImportError(null)
    setFileLoaded(false)

    try {
      const contentFile = csvToArray(await file.text())
      if (contentFile.length === 0) {
        throw new Error('Le fichier CSV est vide ou ne contient pas de ligne exploitable.')
      }

      const rows = contentFile.map((row, index) => {
        const isin = getField(row, ['Code ISIN', 'ISIN', 'Instrument ISIN'])
        const directSymbol = getField(row, ['Symbole', 'Symbol', 'Ticker', 'Ticker symbol'])
        const productName = getField(row, ['Produit', 'Libellé', 'Libelle', 'Nom', 'Instrument', 'Security']) || directSymbol
        const date = parseCsvDate(getField(row, ['Date', "Date d'exécution", 'Date execution', 'Trade date']))
        const quantity = parseCsvNumber(getField(row, ['Quantité', 'Quantite', 'Quantity', 'Qty', 'Nombre']))
        const price = parseCsvNumber(getField(row, ['Cours', 'Prix', 'Price', "Prix d'exécution", 'Execution price']))
        const operationValue = getField(row, ['Type', "Type d'opération", 'Type operation', 'Operation', 'Action', 'Side', 'Sens'])
        const operation = operationValue ? getTransactionType(operationValue) : quantity < 0 ? 'SELL' : 'BUY'

        if (!productName || !date || !Number.isFinite(quantity) || !Number.isFinite(price) || quantity === 0 || price <= 0) {
          throw new Error(`Ligne ${index + 2} incomplète : produit, date, quantité et prix sont obligatoires.`)
        }

        return {
          row,
          isin,
          directSymbol,
          productName,
          date,
          quantity: Math.abs(quantity),
          price: Math.abs(price),
          operation,
        }
      })

      const products = distinct(
        rows
          .filter((row) => row.isin)
          .map((row) => ({ stockName: row.productName, isin: row.isin })),
        'isin'
      )
      let symbols: Array<{ isin: string; symbol: string }> = []
      if (products.length > 0) {
        try {
          symbols = await getProductsSymbols({ stockNames: products })
        } catch (error) {
          console.warn('Could not resolve CSV ISINs automatically:', error)
        }
      }
      const symbolByIsin = new Map((symbols || []).map((symbol) => [symbol.isin, symbol.symbol]))

      const extractedTransactions = rows.map((row, index) => {
        const resolvedSymbol = row.directSymbol || symbolByIsin.get(row.isin) || ''
        const signedQuantity = row.operation === 'SELL' ? -row.quantity : row.quantity

        return {
          id: getField(row.row, ['ID Ordre', 'ID', 'Order ID', 'Référence', 'Reference']) || `import-${Date.now()}-${index}`,
          productName: row.productName,
          type: row.operation === 'SELL' ? 'Vendre' : row.operation === 'FREE' ? 'Attribution gratuite' : 'Acheter',
          date: row.date,
          qty: signedQuantity,
          price: row.price,
          symbol: resolvedSymbol,
          freeShares: row.operation === 'FREE',
        }
      })

      setTransactions(extractedTransactions)
      setFileLoaded(true)
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      setTransactions([])
      setImportError(error instanceof Error ? error.message : 'Impossible de lire ce fichier CSV.')
    } finally {
      setLoading(false)
      event.currentTarget.value = ''
    }
  }

  const dumpTransactions = async () => {
    try {
      setLoading(true)
      await addTransactions(id, transactions)
      router.back()
    } catch (error) {
      console.error('error dumping ...', error)
      setImportError(error instanceof Error ? error.message : 'Impossible d\'enregistrer les transactions.')
    } finally {
      setLoading(false)
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
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Importer depuis un fichier CSV</h1>
      </div>

      {importError && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {importError}
        </div>
      )}

      <div className="flex flex-col content-center items-center gap-2 px-6">
        {!fileLoaded && (
          <div className="w-full py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="compte">Compte</Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Degiro">Degiro</SelectItem>
                  <SelectItem value="Boursorama">Boursorama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="compte">Fichier</Label>
              <Input type="file" accept=".csv,text/csv" onChange={handleFile}></Input>
            </div>
          </div>
        )}

        {transactions.filter(noExistingSymbol).length > 0 && (
          <div className='py-6" w-full'>
            <p>
              Les produit suivants n'ont pas été trouver: cherchez les manuellement ou supprimer les
              transactions liés
            </p>

            <div>
              {transactions
                .filter(
                  (transaction, i, arr) =>
                    arr.findIndex((t) => t.productName === transaction.productName) === i
                )
                .map((t) => (
                  <div key={t.productName} className="grid w-full grid-cols-4 gap-4 py-1">
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
