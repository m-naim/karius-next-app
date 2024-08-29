import React from 'react'
import TransactionDialogue from '../transactionDialogue'
import { Pencil, Trash2 } from 'lucide-react'

export const Transactions = ({ id, transactionState }) => {
  const [transactions, setTransactions] = transactionState

  const handleRemoval = (idt) => {
    setTransactions(transactions.filter((t) => t.id !== idt))
  }

  return (
    <div className="flex w-full flex-col">
      <h1 className="h1">Transactions</h1>

      <div className="divide-y">
        <div className="grid w-full grid-cols-8 gap-6 py-2">
          <div className="texte-xl  font-semibold"> Symbol</div>
          <div className="texte-xl col-span-2 font-semibold"> Produit</div>
          <div className="texte-xl font-semibold"> Date</div>
          <div className="texte-xl text-right font-semibold"> Prix</div>
          <div className="texte-xl text-right font-semibold"> Quantité</div>
          <div className="texte-xl text-right font-semibold"> Frais de courtage</div>
        </div>
        {transactions.map((t) => (
          <div key={t.id} className="grid w-full grid-cols-8 gap-6 py-1">
            <div className=""> {t.symbol}</div>
            <div className="col-span-2"> {t.productName}</div>
            <div> {t.date}</div>
            <div className="text-right"> {t.price}</div>
            <div className="text-right"> {t.qty}</div>
            <div className="text-right"> {t['Frais de courtage']} </div>
            <div className="flex gap-2 py-1">
              <TransactionDialogue
                initialData={t}
                Trigger={() => <Pencil size={16} />}
                submitHandler={async (newTransactionsValues) => {
                  const newArray = transactions.map((t) => {
                    if (t.id === newTransactionsValues.id) {
                      return {
                        ...t,
                        ...newTransactionsValues,
                      }
                    } else {
                      return t
                    }
                  })

                  setTransactions(newArray)
                }}
              />
              <Trash2 size={16} onClick={() => handleRemoval(t.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
