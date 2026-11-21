import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { build } from 'esbuild'
import { resolve } from 'node:path'
import { decodeSession, saveSession, accessToken, clearSession, storedToken, SESSION_EVENT, verifySessionToken } from '../lib/auth-session.ts'

const token = claims => `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`
const valid = (sub = 'user@example.com') => token({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })
let storage, events, notifications
beforeEach(() => {
  storage = new Map()
  globalThis.window = Object.assign(new EventTarget(), { localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } })
  events = []
  notifications = []
  globalThis.authTestToast = value => notifications.push(value)
  window.addEventListener(SESSION_EVENT, event => events.push(event.detail?.reason))
})

const bundled = await build({
  entryPoints: [resolve('services/http.ts')], bundle: true, write: false,
  platform: 'node', format: 'esm', alias: { '@': process.cwd() },
  plugins: [{ name: 'toast-test', setup(build) {
    build.onResolve({ filter: /^@\/hooks\/use-toast$/ }, () => ({ path: 'toast', namespace: 'test' }))
    build.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const toast = value => globalThis.authTestToast(value)' }))
  } }],
})
const { default: http } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`)

test('decodes Unicode subjects and Base64URL payloads', () => {
  assert.equal(decodeSession(valid('élève@example.com')).sub, 'élève@example.com')
})
test('rejects malformed, missing and expired claims without throwing', () => {
  for (const value of [null, 'garbage', 'a.%%.b', token({ sub: 'a' }), token({ sub: 'a', exp: '9999999999' }), token({ exp: 9999999999 }), token({ sub: 'a', exp: 1 })])
    assert.equal(decodeSession(value), null)
})
test('expired session clears token and legacy user exactly once', () => {
  storage.set('accessToken', token({ sub: 'user', exp: 1 }))
  storage.set('user', 'stale cached identity')
  assert.equal(accessToken(), null)
  assert.equal(accessToken(), null)
  assert.equal(storage.has('user'), false)
  assert.deepEqual(events, ['expired'])
})
test('logout clears both session records and notifies the provider', () => {
  saveSession(valid())
  clearSession()
  assert.equal(storedToken(), null)
  assert.equal(storage.has('user'), false)
  assert.equal(events.at(-1), 'logout')
})
test('login does not send an old token or disconnect on incorrect credentials', async () => {
  const previous = valid()
  saveSession(previous)
  globalThis.fetch = async (_path, options) => {
    assert.equal(options.headers.Authorization, undefined)
    return new Response('{}', { status: 401 })
  }
  await assert.rejects(http.post('https://api.test/auth/login', {}), { status: 401 })
  assert.equal(storedToken(), previous)
  assert.equal(events.includes('rejected'), false)
})
test('API rejection clears session and notifies the provider once', async () => {
  saveSession(valid())
  globalThis.fetch = async () => new Response('{}', { status: 401 })
  await assert.rejects(http.get('https://api.test/api/v1/profile/'), { status: 401 })
  assert.equal(storedToken(), null)
  assert.equal(events.filter(value => value === 'rejected').length, 1)
})
test('403 preserves the authenticated session', async () => {
  const previous = valid()
  saveSession(previous)
  globalThis.fetch = async () => new Response('{}', { status: 403 })
  await assert.rejects(http.get('https://api.test/admin'), { status: 403 })
  assert.equal(storedToken(), previous)
  assert.equal(notifications.at(-1).title, 'Accès refusé')
})
test('an old 401 response cannot clear a newer login', async () => {
  saveSession(valid('old'))
  let respond
  globalThis.fetch = () => new Promise(resolve => { respond = resolve })
  const pending = http.get('https://api.test/profile')
  const renewed = valid('new')
  saveSession(renewed)
  respond(new Response('{}', { status: 401 }))
  await assert.rejects(pending, { status: 401 })
  assert.equal(storedToken(), renewed)
})
test('concurrent rejections only invalidate the session once', async () => {
  saveSession(valid())
  globalThis.fetch = async () => new Response('{}', { status: 401 })
  await Promise.allSettled([http.get('https://api.test/a'), http.get('https://api.test/b')])
  assert.equal(events.filter(value => value === 'rejected').length, 1)
})
test('aborted requests preserve the session without a network error toast', async () => {
  const previous = valid()
  saveSession(previous)
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }
  await assert.rejects(http.get('https://api.test/a'), { name: 'AbortError' })
  assert.equal(storedToken(), previous)
  assert.equal(notifications.length, 0)
})

test('an anonymous request rejected after login cannot clear the new session', async () => {
  let respond
  globalThis.fetch = () => new Promise(resolve => { respond = resolve })
  const pending = http.get('https://api.test/profile')
  const renewed = valid('new')
  saveSession(renewed)
  respond(new Response('{}', { status: 401 }))
  await assert.rejects(pending, { status: 401 })
  assert.equal(storedToken(), renewed)
})


test('a stored JWT is only confirmed after server validation', async () => {
  const jwt = valid()
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, `Bearer ${jwt}`)
    assert.equal(options.cache, 'no-store')
    return new Response('{}', { status: 200 })
  }
  assert.equal(await verifySessionToken(jwt, 'https://api.test/profile'), 'valid')
})

test('server rejection is detected even for a JWT whose expiry is in the future', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 401 })
  assert.equal(await verifySessionToken(valid(), 'https://api.test/profile'), 'rejected')
})

test('server outages never falsely confirm a session or destroy the saved token', async () => {
  const jwt = valid()
  saveSession(jwt)
  for (const status of [403, 429, 500, 503]) {
    globalThis.fetch = async () => new Response('{}', { status })
    assert.equal(await verifySessionToken(jwt, 'https://api.test/profile'), 'unavailable')
    assert.equal(storedToken(), jwt)
  }
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  assert.equal(await verifySessionToken(jwt, 'https://api.test/profile'), 'unavailable')
  assert.equal(storedToken(), jwt)
})
