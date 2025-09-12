async function CheckError(response) {
  if (response.status >= 200 && response.status <= 299) {
    try {
      const data = await response.json()
      return data
    } catch (e) {
      console.error(e)
      return response
    }
  }
  console.error('error', response)
  throw Error(response.status)
}

function authHeader() {
  if (typeof window !== 'undefined' && localStorage.getItem('accessToken') !== null) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` }
    }
  }
  return
}

function post(path, body) {
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

function get(path, sse = false) {
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

function put(path, body) {
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

function deleteReq(path) {
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
