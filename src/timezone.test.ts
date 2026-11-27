import { describe, expect, it } from 'vitest'
import { BUSINESS_TIMEZONE, getCairoDateKey, getCairoDateTimeLocalValue, getCairoTimeValue, getCairoUtcDayRange, getCairoUtcIsoFromDateTimeLocal } from './timezone'

describe('Africa/Cairo day boundaries', () => {
  it('converts the selected Cairo calendar day into UTC boundaries', () => {
    expect(getCairoUtcDayRange('2026-11-27')).toEqual({ fromUtc: '2026-11-26T22:00:00Z', toUtc: '2026-11-27T22:00:00Z' })
  })

  it('uses UTC+3 when Cairo is observing daylight saving time', () => {
    expect(getCairoUtcDayRange('2026-07-15')).toEqual({ fromUtc: '2026-07-14T21:00:00Z', toUtc: '2026-07-15T21:00:00Z' })
  })

  it('uses UTC+2 when Cairo is on standard time', () => {
    expect(getCairoUtcDayRange('2026-01-15')).toEqual({ fromUtc: '2026-01-14T22:00:00Z', toUtc: '2026-01-15T22:00:00Z' })
  })
})

describe('Cairo timestamp helpers', () => {
  it('exposes the business timezone as Africa/Cairo', () => {
    expect(BUSINESS_TIMEZONE).toBe('Africa/Cairo')
  })

  it('converts a UTC timestamp into the Cairo calendar date and time', () => {
    expect(getCairoDateKey('2026-11-26T22:00:00Z')).toBe('2026-11-27')
    expect(getCairoTimeValue('2026-11-26T22:00:00Z')).toBe('00:00')
    expect(getCairoDateTimeLocalValue('2026-11-26T22:00:00Z')).toBe('2026-11-27T00:00')
  })

  it('converts a Cairo local datetime value back into a UTC timestamp', () => {
    expect(getCairoUtcIsoFromDateTimeLocal('2026-11-27T00:00')).toBe('2026-11-26T22:00:00Z')
    expect(getCairoUtcIsoFromDateTimeLocal('2026-11-27T10:30')).toBe('2026-11-27T08:30:00Z')
  })
})
