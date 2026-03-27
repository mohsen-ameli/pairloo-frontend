export function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  // Remove time for comparison
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  // Format time without seconds
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isToday) {
    return time
  } else if (isYesterday) {
    return `Yesterday, ${time}`
  } else {
    // Show date and time, no seconds
    return date.toLocaleDateString() + ", " + time
  }
}

export function sinceNow(dateString: string | null | undefined): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()

  const seconds = Math.floor(diffInMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return years === 1 ? "1yr" : `${years}yrs`
  if (months > 0) return months === 1 ? "1mo" : `${months}mo`
  if (weeks > 0) return weeks === 1 ? "1w" : `${weeks}w`
  if (days > 0) return days === 1 ? "1d" : `${days}d`
  if (hours > 0) return hours === 1 ? "1h" : `${hours}h`
  if (minutes > 0) return minutes === 1 ? "1m" : `${minutes}m`
  return "now"
}

export function formatDateDayMonthYear(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
