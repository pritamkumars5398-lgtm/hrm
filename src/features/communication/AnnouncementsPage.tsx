import { useState } from 'react'
import { Megaphone, Plus, Bell, Calendar, Pin, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'

type Announcement = {
  id: string
  title: string
  content: string
  postedBy: string
  date: string
  isPinned?: boolean
  category: 'General' | 'Important' | 'Event' | 'Holiday'
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Quarterly Sprint Planning & Department Review',
    content: 'Team, please ensure all pending task logs for this sprint are submitted by Friday 5 PM. We will hold our sprint review and Q4 roadmap alignment on Monday at 10:30 AM.',
    postedBy: 'Samuel Okafor (Engineering Manager)',
    date: 'Today at 02:15 PM',
    isPinned: true,
    category: 'Important'
  },
  {
    id: 'ann-2',
    title: 'Diwali Festival Holiday & Celebrations',
    content: 'Wishing everyone a very Happy Diwali in advance! The office will remain closed for the national festival break. Please plan your client deliverables accordingly.',
    postedBy: 'HR Operations',
    date: 'Yesterday at 11:30 AM',
    isPinned: true,
    category: 'Event'
  },
  {
    id: 'ann-3',
    title: 'Weekly Team 1-on-1 Sync Slots Open',
    content: 'Check your calendar invites for this week’s 1-on-1 progress check-ins. If you need to reschedule your slot, please ping on direct message.',
    postedBy: 'Samuel Okafor (Manager)',
    date: '28 Oct 2026',
    isPinned: false,
    category: 'General'
  }
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<Announcement['category']>('General')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const item: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      content: newContent,
      postedBy: 'Manager (You)',
      date: 'Just now',
      isPinned: false,
      category: newCategory
    }

    setAnnouncements([item, ...announcements])
    setNewTitle('')
    setNewContent('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Team Broadcasts</p>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink flex items-center gap-2">
            <Megaphone className="text-emerald-600" size={26} /> Announcements
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Share important updates, deadlines, and notifications with your team.
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs"
        >
          <Plus size={14} /> New Announcement
        </Button>
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <Card className="p-5 border border-emerald-500/20 bg-emerald-50/20">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                <Megaphone size={16} className="text-emerald-700" /> Post Team Announcement
              </h3>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Announcement['category'])}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-hairline bg-surface text-ink"
              >
                <option value="General">General</option>
                <option value="Important">Important</option>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="Announcement Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-hairline bg-surface text-ink focus:outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <textarea
                placeholder="Type your announcement details here for the team..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-hairline bg-surface text-ink focus:outline-none focus:border-emerald-600 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:text-ink hover:bg-wash transition cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" className="text-xs flex items-center gap-1.5">
                <Send size={13} /> Publish to Team
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements Feed */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <Card key={item.id} className="p-5 space-y-3 border border-hairline/70 hover:shadow-xs transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {item.isPinned && (
                  <span className="p-1 rounded-md bg-amber-50 text-amber-700" title="Pinned Announcement">
                    <Pin size={13} />
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase tracking-wider ${item.category === 'Important'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : item.category === 'Event'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                  {item.category}
                </span>
                <span className="text-[11.5px] text-muted font-medium">· {item.date}</span>
              </div>

              <span className="text-xs text-muted font-medium">{item.postedBy}</span>
            </div>

            <h3 className="font-bold text-ink text-[15.5px] leading-snug">{item.title}</h3>
            <p className="text-xs text-muted/90 leading-relaxed">{item.content}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

