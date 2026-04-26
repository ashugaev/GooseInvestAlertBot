import { summarizeFailedTickers } from '@/marketApi/tinkoff/api/summarizeFailedTickers'

describe('summarizeFailedTickers', () => {
  it('returns null for empty input', () => {
    expect(summarizeFailedTickers([])).toBeNull()
  })

  it('returns count and capped sample by default (5)', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    expect(summarizeFailedTickers(ids)).toEqual({
      count: 7,
      sample: ['a', 'b', 'c', 'd', 'e'],
    })
  })

  it('respects custom sampleSize', () => {
    const ids = ['a', 'b', 'c', 'd']
    expect(summarizeFailedTickers(ids, { sampleSize: 2 })).toEqual({
      count: 4,
      sample: ['a', 'b'],
    })
  })

  it('returns null when below minCount threshold', () => {
    expect(
      summarizeFailedTickers(['a', 'b'], { minCount: 5 })
    ).toBeNull()
  })

  it('returns summary when at or above minCount threshold', () => {
    const ids = Array.from({ length: 6 }, (_, i) => `id${i}`)
    const res = summarizeFailedTickers(ids, { minCount: 5, sampleSize: 3 })
    expect(res).toEqual({ count: 6, sample: ['id0', 'id1', 'id2'] })
  })

  it('does not mutate the input array', () => {
    const ids = ['a', 'b', 'c']
    summarizeFailedTickers(ids, { sampleSize: 1 })
    expect(ids).toEqual(['a', 'b', 'c'])
  })
})
