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
