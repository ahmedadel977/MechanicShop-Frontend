export const BUSINESS_TIMEZONE = 'Africa/Cairo'

const timeZone = BUSINESS_TIMEZONE

const getTimeZoneOffsetMinutes = (zone: string, instant: Date): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(instant)
  const field = (type: string): number => Number(parts.find(part => part.type === type)?.value ?? '0')
  const wallClockMs = Date.UTC(field('year'), field('month') - 1, field('day'), field('hour'), field('minute'), field('second'))
  return Math.round((wallClockMs - instant.getTime()) / 60_000)
}

const cairoWallTimeToUtcMs = (year: number, month: number, day: number, hour: number, minute = 0): number => {
  const wallClockMs = Date.UTC(year, month - 1, day, hour, minute)
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, new Date(wallClockMs))
  return wallClockMs - offsetMinutes * 60_000
}

const toUtcIsoString = (utcMs: number): string => new Date(utcMs).toISOString().replace('.000Z', 'Z')

export const getCairoUtcDayRange = (dateKey: string): { fromUtc: string; toUtc: string } => {
  const [year, month, day] = dateKey.split('-').map(Number)
  const fromUtcMs = cairoWallTimeToUtcMs(year, month, day, 0)
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1))
  const toUtcMs = cairoWallTimeToUtcMs(nextDay.getUTCFullYear(), nextDay.getUTCMonth() + 1, nextDay.getUTCDate(), 0)
  return { fromUtc: toUtcIsoString(fromUtcMs), toUtc: toUtcIsoString(toUtcMs) }
}

export const formatInCairo = (utcTimestamp: string, options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(new Date(utcTimestamp))

export const getCairoDateKey = (utcTimestamp: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(utcTimestamp))
  const field = (type: string): number => Number(parts.find(part => part.type === type)?.value ?? '0')
  const year = field('year')
  const month = String(field('month')).padStart(2, '0')
  const day = String(field('day')).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getCairoTimeValue = (utcTimestamp: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit'
  }).formatToParts(new Date(utcTimestamp))
  const hour = String(parts.find(part => part.type === 'hour')?.value ?? '0').padStart(2, '0')
  const minute = String(parts.find(part => part.type === 'minute')?.value ?? '0').padStart(2, '0')
  return `${hour}:${minute}`
}

export const getCairoDateTimeLocalValue = (utcTimestamp: string): string => {
  const dateKey = getCairoDateKey(utcTimestamp)
  return `${dateKey}T${getCairoTimeValue(utcTimestamp)}`
}

export const getCairoUtcIsoFromDateTimeLocal = (value: string): string => {
  const [dateKey, timeValue] = value.split('T')
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hour, minute] = (timeValue || '00:00').split(':').map(Number)
  const utcMs = cairoWallTimeToUtcMs(year, month, day, hour, minute)
  return toUtcIsoString(utcMs)
}
