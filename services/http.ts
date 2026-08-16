import { toast } from '@/hooks/use-toast'

export class HttpError extends Error {
  status: number
  data: any

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

async function CheckError(response: Response) {
  if (response.ok) {
    try {
      // Handle empty responses
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    } catch (e) {
      console.error('Failed to parse JSON response:', e)
      return response
    }
  }

  let errorData: any = null
  let errorMessage = `HTTP Error ${response.status}`

  try {
    errorData = await response.json()
    if (errorData && (errorData.message || errorData.error)) {
      errorMessage = errorData.message || errorData.error
    }
  } catch (e) {
    // If not JSON, ignore
  }

  console.error('HTTP request failed:', {
    status: response.status,
    url: response.url,
    data: errorData,
  })

  // Specific handling for common status codes
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const hadToken = !!localStorage.getItem('accessToken')
      localStorage.removeItem('accessToken')
      if (hadToken) {
        toast({
          variant: 'destructive',
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter pour continuer à synchroniser vos données.',
        })
      }
    }
  } else if (response.status === 429) {
    if (typeof window !== 'undefined') {
      toast({
        variant: 'destructive',
        title: 'Limite de requêtes atteinte',
        description: 'Veuillez patienter quelques secondes avant de relancer cette action.',
      })
    }
  } else if (response.status >= 500) {
    if (typeof window !== 'undefined') {
      toast({
        variant: 'destructive',
        title: 'Service momentanément indisponible',
        description: 'Nos serveurs traitent une charge importante. Veuillez réessayer dans quelques instants.',
      })
    }
  }

  throw new HttpError(response.status, errorMessage, errorData)
}

function handleNetworkError(err: any) {
  if (!(err instanceof HttpError) && typeof window !== 'undefined') {
    toast({
      variant: 'destructive',
      title: 'Connexion interrompue',
      description: 'Impossible de joindre les serveurs. Vérifiez votre connexion Internet.',
    })
  }
}

function authHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` }
    }
  }
  return {}
}

function post(path: string, body: any) {
  return fetch(`${path}`, {
    credentials: 'omit',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'sec-fetch-mode': 'cors',
      ...authHeader(),
    },
    body: JSON.stringify(body),
    method: 'POST',
    mode: 'cors',
  })
    .then(CheckError)
    .catch((err) => {
      handleNetworkError(err)
      throw err
    })
}

function get(path: string) {
  return fetch(`${path}`, {
    credentials: 'omit',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'sec-fetch-mode': 'cors',
      ...authHeader(),
    },
    method: 'GET',
    mode: 'cors',
  })
    .then(CheckError)
    .catch((err) => {
      handleNetworkError(err)
      throw err
    })
}

function put(path: string, body: any) {
  return fetch(`${path}`, {
    credentials: 'omit',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'sec-fetch-mode': 'cors',
      ...authHeader(),
    },
    body: JSON.stringify(body),
    method: 'PUT',
    mode: 'cors',
  })
    .then(CheckError)
    .catch((err) => {
      handleNetworkError(err)
      throw err
    })
}

function deleteReq(path: string) {
  return fetch(`${path}`, {
    credentials: 'omit',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'sec-fetch-mode': 'cors',
      ...authHeader(),
    },
    method: 'DELETE',
    mode: 'cors',
  })
    .then(CheckError)
    .catch((err) => {
      handleNetworkError(err)
      throw err
    })
}

const http = {
  post,
  get,
  put,
  deleteReq,
}

export default http
