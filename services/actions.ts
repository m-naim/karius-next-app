'use server'

import clientPromise from '@/lib/mongodb'

export const addEmail = async (prevState, formData) => {
  const client = await clientPromise
  const collection = client.db('investing').collection('emails')
  const email = formData.get('email')
  collection.insertOne({ email, date: new Date() })
  // store the post in the database directly
  return { error: null, success: true }
}

export const findStockBySymbol = async (symbol) => {
  const client = await clientPromise
  return await client.db('investing').collection('stocks').findOne({ _id: symbol })
}

export const getPublicWatchlists = async () => {
  const client = await clientPromise
  let res = await client
    .db('investing')
    .collection('watchlists')
    .find({ is_public: true })
    .toArray()
  if (res == null) return []
  return res
}

export const getPublicPortfolios = async () => {
  const client = await clientPromise
  let res = await client
    .db('investing')
    .collection('portfolios')
    .find({ public: true }, { projection: { _id: 1, name: 1, allocation: { symbol: 1 } } })
    .toArray()
  if (res == null) return []
  return res
}
