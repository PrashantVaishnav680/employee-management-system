export const todayInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const isTodayOrFuture = (value) => value >= todayInputValue()
