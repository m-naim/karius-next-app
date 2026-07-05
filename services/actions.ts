'use server'

export const addEmail = async (prevState: any, formData: FormData) => {
  const email = formData.get('email')
  console.log('Newsletter subscription request received for:', email)
  return { error: null, success: true }
}

export const findStockBySymbol = async (symbol: string) => {
  return null
}

export const getPublicWatchlists = async () => {
  return []
}

