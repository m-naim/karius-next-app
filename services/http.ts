import { getLocalStorageItem } from '@/lib/utils'

async function CheckError(response) {
  const data = await response.json()

  if (response.status >= 200 && response.status <= 299) {
    return data
  }
  console.log(data.msg)
  throw Error(data.msg)
}

function authHeader() {
  if (typeof window !== 'undefined' && getLocalStorageItem('user') !== '') {
    const user = JSON.parse(getLocalStorageItem('user'))
    if (user && user.token) {
      return { 'x-auth-token': user.token }
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

function get(path) {
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
