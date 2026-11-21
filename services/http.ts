import { toast } from '@/hooks/use-toast'
import { accessToken, clearSession } from '@/lib/auth-session'

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

async function CheckError(response: Response, token: string | null, authenticationRequest: boolean) {
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
  } catch {
    // If not JSON, ignore
  }

  console.error('HTTP request failed:', {
    status: response.status,
    url: response.url,
    data: errorData,
  })

  // Specific handling for common status codes
  if (response.status === 401 && !authenticationRequest) {
    clearSession(token ? 'rejected' : 'required', token)
  } else if (response.status === 403 && !authenticationRequest) {
    toast({
      variant: 'destructive',
      title: 'Accès refusé',
      description: 'Votre compte ne dispose pas des droits nécessaires pour cette action.',
    })
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

function isAbortError(err: any) {
  return err?.name === 'AbortError'
}

function handleNetworkError(err: any) {
  if (!isAbortError(err) && !(err instanceof HttpError) && typeof window !== 'undefined') {
    toast({
      variant: 'destructive',
      title: 'Connexion interrompue',
      description: 'Impossible de joindre les serveurs. Vérifiez votre connexion Internet.',
    })
  }
}

async function request(path: string, method: string, body?: unknown, options: { signal?: AbortSignal } = {}) {
  const authenticationRequest = /\/auth\/(login|register)\/?(?:\?|$)/.test(path)
  const token = authenticationRequest ? null : accessToken()
  try {
    const response = await fetch(path, {
      credentials: 'omit',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      method,
      mode: 'cors',
      signal: options.signal,
    })
    return await CheckError(response, token, authenticationRequest)
  } catch (err) {
    handleNetworkError(err)
    throw err
  }
}

const http = {
  post: (path: string, body: unknown) => request(path, 'POST', body),
  get: (path: string, options: { signal?: AbortSignal } = {}) => request(path, 'GET', undefined, options),
  put: (path: string, body: unknown) => request(path, 'PUT', body),
  deleteReq: (path: string) => request(path, 'DELETE'),
}

export default http
