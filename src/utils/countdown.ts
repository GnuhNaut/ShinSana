export interface CountdownParts { days: number; hours: number; minutes: number; seconds: number; isComplete: boolean }
const SECOND = 1_000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export function getCountdownParts(target: string | Date, now = new Date()): CountdownParts {
  const targetTime = target instanceof Date ? target.getTime() : new Date(target).getTime()
  const difference = Math.max(0, targetTime - now.getTime())
  if (!Number.isFinite(targetTime) || difference === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true }
  return { days: Math.floor(difference / DAY), hours: Math.floor((difference % DAY) / HOUR), minutes: Math.floor((difference % HOUR) / MINUTE), seconds: Math.floor((difference % MINUTE) / SECOND), isComplete: false }
}
