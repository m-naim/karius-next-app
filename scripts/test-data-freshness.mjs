import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  calendarDate,
  freshnessState,
  formatFreshnessDate,
  quoteFreshness,
  performanceFreshness,
  combinedFreshness,
} from '../lib/data-freshness.ts'

const today = '2026-11-15T12:00:00Z' // Sunday: Friday prices must still be orange.

test('uses the Paris calendar day, including summer time and midnight', () => {
  assert.equal(calendarDate('2026-11-14T23:30:00Z'), '2026-11-15')
  assert.equal(calendarDate('2026-07-01T22:30:00Z'), '2026-07-02')
  assert.equal(calendarDate('2026-11-15'), '2026-11-15')
  assert.equal(calendarDate('2026-02-30'), null)
  assert.equal(calendarDate('invalid'), null)
  assert.equal(calendarDate(null), null)
})

test('marks Friday prices orange on Sunday; hours within today remain current', () => {
  assert.equal(
    freshnessState(quoteFreshness({ symbol: 'A', quoteAsOf: '2026-11-13' }), today).isStale,
    true
  )
  assert.equal(
    freshnessState(quoteFreshness({ symbol: 'A', quoteAsOf: '2026-11-15T06:00:00Z' }), today)
      .isStale,
    false
  )
})

test('an old input or an old calculation is sufficient, including upstream cached calculations', () => {
  const source = { symbol: 'A', asOf: '2026-11-15' }
  assert.equal(
    freshnessState({ calculatedAt: today, sources: [{ ...source, asOf: '2026-11-13' }] }, today)
      .isStale,
    true
  )
  assert.equal(
    freshnessState({ calculatedAt: '2026-11-13', sources: [source] }, today).isStale,
    true
  )
  assert.equal(
    freshnessState(
      {
        calculatedAt: today,
        upstreamCalculatedAt: '2026-11-13',
        sources: [source],
      },
      today
    ).isStale,
    true
  )
})

test('counts and identifies one old ticker among twenty; undated sources stay unknown', () => {
  const sources = Array.from({ length: 20 }, (_, i) => ({
    symbol: `T${i}`,
    asOf: i ? '2026-11-15' : '2026-11-13',
  }))
  const state = freshnessState({ sources }, today)
  assert.equal(state.stale.length, 1)
  assert.equal(state.stale[0].symbol, 'T0')
  const unknown = freshnessState(quoteFreshness({ symbol: 'A' }), today)
  assert.equal(unknown.unknown.length, 1)
  assert.equal(unknown.isStale, false)
})

test('chooses the dates of the data used by the selected period and by FX valuation', () => {
  const security = {
    symbol: 'A',
    quoteAsOf: today,
    valuationAsOf: '2026-11-13',
    variationsCalculatedAt: '2026-11-14',
    variationsAsOf: '2026-11-12',
  }
  assert.equal(freshnessState(performanceFreshness(security, '1d'), today).isStale, false)
  assert.equal(performanceFreshness(security, '1m').sources[0].asOf, '2026-11-12')
  assert.equal(freshnessState(quoteFreshness(security, true), today).isStale, true)
  assert.equal(
    combinedFreshness([performanceFreshness(security, '1m'), { calculatedAt: today, sources: [] }])
      .calculatedAt,
    '2026-11-14'
  )
  const partial = combinedFreshness([
    performanceFreshness(security, '1m'),
    { calculatedAt: null, sources: [] },
  ])
  assert.equal(partial.calculatedAt, '2026-11-14')
  assert.equal(partial.unknownCalculation, true)
  assert.equal(freshnessState(partial, today).isStale, true)
})

test('formats visible dates and exact times without inventing a time for daily data', () => {
  assert.equal(formatFreshnessDate('2026-11-15', today), 'Aujourd’hui')
  assert.equal(formatFreshnessDate('2026-11-15T09:30:00Z', today), 'Aujourd’hui à 10:30')
  assert.equal(formatFreshnessDate(null, today), 'Date inconnue')
  assert.match(
    formatFreshnessDate('2026-11-13T16:35:00Z', today, true),
    /13 novembre 2026 à 17:35.*Paris/
  )
})
