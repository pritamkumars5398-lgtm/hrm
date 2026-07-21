/** "2h ago" / "3d ago" from a real timestamp — falls back to a generic label
 *  when one isn't available. */
export function timeAgo(iso: string | undefined): string {
  if (!iso) return 'Recently'
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
