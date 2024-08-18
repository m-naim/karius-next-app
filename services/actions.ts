'use server'

import clientPromise from '@/lib/mongodb'
import { WatchListInfos } from 'app/app/watchlist/page'

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
  try {
    const client = await clientPromise
    let res = await client
      .db('investing')
      .collection<WatchListInfos>('watchlists')
      .find({ public: true })
      .toArray()
    if (res == null) return []
    return res
  } catch (e) {
    console.error('error api:', e)
    return []
  }
}
