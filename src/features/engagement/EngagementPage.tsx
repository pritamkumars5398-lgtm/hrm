import { useState } from 'react'
import { HeartHandshake, ThumbsUp, MessageSquare, Award, Send, Sparkles, Cake, PartyPopper } from 'lucide-react'

type FeedItem = {
  id: string
  author: string
  role: string
  type: 'KUDOS' | 'ANNOUNCEMENT' | 'BIRTHDAY'
  content: string
  targetUser?: string
  badge?: string
  likes: number
  time: string
}

const INITIAL_FEED: FeedItem[] = [
  { id: 'f-1', author: 'Priya Sharma', role: 'HR Manager', type: 'KUDOS', content: 'Huge shoutout for delivering the Q3 product roadmap ahead of schedule with zero production bugs! 🚀', targetUser: 'Rahul Mehta', badge: 'Star Performer', likes: 14, time: '2 hours ago' },
  { id: 'f-2', author: 'Workplace Team', role: 'System Admin', type: 'BIRTHDAY', content: 'Wishing Vikram Mehta a very Happy Birthday today! 🎉🎂 Drop your wishes below!', likes: 22, time: '5 hours ago' },
  { id: 'f-3', author: 'CEO Desk', role: 'Executive', type: 'ANNOUNCEMENT', content: 'Excited to announce our Q3 All-Hands meeting scheduled for Friday 4 PM. We will review company growth & top performers!', likes: 31, time: '1 day ago' },
]

export default function EngagementPage() {
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED)
  const [postText, setPostText] = useState('')
  const [kudosUser, setKudosUser] = useState('Rahul Mehta')
  const [badge, setBadge] = useState('Team Player')

  const handlePostKudos = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postText.trim()) return
    const newPost: FeedItem = {
      id: `f-${Date.now()}`,
      author: 'Priya Sharma',
      role: 'HR Manager',
      type: 'KUDOS',
      content: postText,
      targetUser: kudosUser,
      badge,
      likes: 1,
      time: 'Just now'
    }
    setFeed([newPost, ...feed])
    setPostText('')
  }

  const handleLike = (id: string) => {
    setFeed(prev => prev.map(f => f.id === id ? { ...f, likes: f.likes + 1 } : f))
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-pink-950 text-white p-6 rounded-2xl border border-pink-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HeartHandshake size={14} /> Culture, Recognition & Peer Kudos
          </div>
          <h1 className="text-2xl font-bold font-display">Company Feed & Employee Engagement</h1>
          <p className="text-slate-300 text-sm mt-1">Send virtual kudos, celebrate work anniversaries, and participate in company polls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Box */}
          <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-pink-500" /> Send Kudos & Peer Recognition
            </h3>
            <form onSubmit={handlePostKudos} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Recognize a colleague for their outstanding work..."
                value={postText}
                onChange={e => setPostText(e.target.value)}
                className="w-full p-3 rounded-xl border border-hairline focus:border-pink-500 focus:outline-none text-xs"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <select
                    value={kudosUser}
                    onChange={e => setKudosUser(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-hairline font-semibold text-ink bg-wash"
                  >
                    <option value="Rahul Mehta">To: Rahul Mehta</option>
                    <option value="Ananya Verma">To: Ananya Verma</option>
                    <option value="Vikram Mehta">To: Vikram Mehta</option>
                  </select>

                  <select
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-hairline font-semibold text-ink bg-wash"
                  >
                    <option value="Team Player">🏆 Team Player</option>
                    <option value="Star Performer">🌟 Star Performer</option>
                    <option value="Problem Solver">💡 Problem Solver</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  <Send size={14} /> Post Kudos
                </button>
              </div>
            </form>
          </div>

          {/* Feed Items */}
          <div className="space-y-4">
            {feed.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs">
                      {item.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-ink">{item.author}</h4>
                      <p className="text-[10px] text-muted">{item.role} • {item.time}</p>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Award size={13} /> {item.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-ink leading-relaxed">{item.content}</p>

                <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-muted">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1.5 font-bold hover:text-pink-600 cursor-pointer"
                  >
                    <ThumbsUp size={14} /> {item.likes} High Fives
                  </button>
                  <span className="flex items-center gap-1 text-[11px]">
                    <MessageSquare size={13} /> 3 Comments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Celebrations Widget */}
          <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <PartyPopper size={16} className="text-amber-500" /> Today's Celebrations
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <Cake size={20} className="text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-ink">Vikram Mehta</h4>
                  <p className="text-[10px] text-muted">Birthday Today 🎂</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                <Award size={20} className="text-purple-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-ink">Ananya Verma</h4>
                  <p className="text-[10px] text-muted">2-Year Work Anniversary 🎈</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
