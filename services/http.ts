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
      localStorage.removeItem('accessToken')
      // Optional: window.location.href = '/login'
    }
  }

  // Global notification for server errors or critical failures
  if (response.status >= 500 && typeof window !== 'undefined') {
    // Dynamically import toast to avoid server-side issues with client hooks
    import('@/hooks/use-toast')
      .then((module) => {
        if (module && module.toast) {
          module.toast({
            variant: 'destructive',
            title: 'Erreur Serveur',
            description: 'Une erreur inattendue est survenue sur le serveur.',
          })
        }
      })
      .catch((e) => console.error('Failed to load toast module:', e))
  }

  throw new HttpError(response.status, errorMessage, errorData)
}

function authHeader() {
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
  }).then(CheckError)
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
  }).then(CheckError)
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
  }).then(CheckError)
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
  }).then(CheckError)
}

const http = {
  post,
  get,
  put,
  deleteReq,
}

export default http
