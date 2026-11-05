import { useState } from 'react'
import { Bell, CheckCircle2, Clock, Info, ShieldAlert, Sparkles, Trash2 } from 'lucide-react'
import Card from '@/shared/components/Card'
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore'
import { timeAgo } from '@/shared/utils/timeAgo'

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead } = useNotificationsStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const list = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Alerts & Updates</p>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink flex items-center gap-2">
            <Bell className="text-emerald-600" size={26} /> Notifications
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Company announcements, leave approvals, salary slip updates and tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface border border-hairline p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-muted hover:text-ink'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'unread' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-muted hover:text-ink'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={() => void markAllRead()}
            className="px-3 py-1.5 rounded-xl border border-hairline bg-surface text-xs font-semibold text-muted hover:text-ink hover:bg-wash transition cursor-pointer"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <Card flush className="overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-ink text-sm">All caught up!</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              You don't have any unread notifications right now.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-hairline">
            {list.map((n) => (
              <li
                key={n.id}
                onClick={() => { if (!n.read) void markRead(n.id) }}
                className={`p-4 flex items-start gap-4 transition hover:bg-wash/40 cursor-pointer ${
                  !n.read ? 'bg-emerald-50/20' : ''
                }`}
              >
                <div className={`size-9 rounded-full shrink-0 flex items-center justify-center ${
                  !n.read ? 'bg-emerald-100 text-emerald-800' : 'bg-wash text-muted'
                }`}>
                  <Bell size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm ${!n.read ? 'font-bold text-ink' : 'font-semibold text-ink/80'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-muted font-medium shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{n.body}</p>
                </div>

                {!n.read && (
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0 self-center" />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

