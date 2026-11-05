import { useState, useEffect, useCallback } from 'react'
import {
  HeartHandshake,
  ThumbsUp,
  MessageSquare,
  Award,
  Send,
  Sparkles,
  Cake,
  PartyPopper,
  Trash2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Heart,
} from 'lucide-react'
import {
  engagementService,
  type EngagementPost,
  type Celebration,
} from '../../services/engagementService'

export default function EngagementPage() {
  const [feed, setFeed] = useState<EngagementPost[]>([])
  const [celebrations, setCelebrations] = useState<Celebration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [postText, setPostText] = useState('')
  const [kudosUser, setKudosUser] = useState('Rahul Mehta')
  const [badge, setBadge] = useState('Team Player')
  const [submitting, setSubmitting] = useState(false)

  const fetchEngagement = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await engagementService.getAll()
      setFeed(data.feed)
      setCelebrations(data.celebrations)
    } catch (err: unknown) {
      console.error('Failed to load engagement feed:', err)
      setError('Failed to fetch engagement feed. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEngagement()
  }, [fetchEngagement])

  const handlePostKudos = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postText.trim()) return
    try {
      setSubmitting(true)
      const newPost = await engagementService.create({
        content: postText.trim(),
        targetUser: kudosUser,
        badge,
        type: 'KUDOS',
      })
      setFeed((prev) => [newPost, ...prev])
      setPostText('')
    } catch (err: unknown) {
      console.error('Failed to post kudos:', err)
      alert('Failed to post kudos. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (id: string) => {
    try {
      const updated = await engagementService.like(id)
      setFeed((prev) => prev.map((f) => (f.id === id ? updated : f)))
    } catch (err: unknown) {
      console.error('Failed to like post:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await engagementService.delete(id)
      setFeed((prev) => prev.filter((f) => f.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post.')
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now'
    try {
      const date = new Date(isoString)
      const diffMs = Date.now() - date.getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHrs < 1) {
        const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)))
        return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
      }
      if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`
      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } catch {
      return 'Recently'
    }
  }

  const totalHighFives = feed.reduce((acc, f) => acc + (f.likes || 0), 0)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-pink-950 to-purple-950 text-white p-6 rounded-2xl border border-pink-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HeartHandshake size={14} /> Culture, Recognition & Peer Kudos
          </div>
          <h1 className="text-2xl font-bold font-display">Company Feed & Employee Engagement</h1>
          <p className="text-slate-300 text-sm mt-1">
            Send virtual kudos, celebrate work milestones, high-five teammates, and build company culture.
          </p>
        </div>
        <button
          onClick={fetchEngagement}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2 rounded-xl transition text-xs border border-white/10 w-fit cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Feed
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={fetchEngagement} className="font-bold underline cursor-pointer">
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Box */}
          <div className="bg-white p-5 rounded-2xl border border-hairline shadow-xs">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-pink-500" /> Send Kudos & Peer Recognition
            </h3>
            <form onSubmit={handlePostKudos} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Recognize a colleague for their exceptional work or team support..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full p-3 rounded-xl border border-hairline focus:border-pink-500 focus:outline-none text-xs resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <select
                    value={kudosUser}
                    onChange={(e) => setKudosUser(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-hairline font-semibold text-ink bg-wash cursor-pointer"
                  >
                    <option value="Rahul Mehta">To: Rahul Mehta (Tech Lead)</option>
                    <option value="Ananya Verma">To: Ananya Verma (Operations)</option>
                    <option value="Vikram Mehta">To: Vikram Mehta (Design)</option>
                    <option value="Suresh Raina">To: Suresh Raina (Engineering)</option>
                    <option value="Pooja Hegde">To: Pooja Hegde (Marketing)</option>
                  </select>

                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-hairline font-semibold text-ink bg-wash cursor-pointer"
                  >
                    <option value="Team Player">🏆 Team Player</option>
                    <option value="Star Performer">🌟 Star Performer</option>
                    <option value="Problem Solver">💡 Problem Solver</option>
                    <option value="Culture Champion">🚀 Culture Champion</option>
                    <option value="Customer Hero">❤️ Customer Hero</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send size={14} /> {submitting ? 'Posting...' : 'Post Kudos'}
                </button>
              </div>
            </form>
          </div>

          {/* Feed Items */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-xs text-muted bg-white rounded-2xl border border-hairline">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-pink-600" />
                Loading community feed...
              </div>
            ) : feed.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted bg-white rounded-2xl border border-hairline space-y-2">
                <Sparkles size={32} className="mx-auto text-pink-400" />
                <p className="font-semibold text-ink">No posts in feed yet</p>
                <p className="text-[11px]">Be the first to recognize a colleague!</p>
              </div>
            ) : (
              feed.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-hairline shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs">
                        {item.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-ink">{item.author}</h4>
                          {item.targetUser && (
                            <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                              ➔ {item.targetUser}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted">
                          {item.role} • {formatTime(item.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Award size={13} /> {item.badge}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded transition cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-muted">
                    <button
                      onClick={() => handleLike(item.id)}
                      className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-pink-600 cursor-pointer transition active:scale-95"
                    >
                      <ThumbsUp size={14} className="text-pink-600" />
                      <span>{item.likes} High Fives</span>
                    </button>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare size={13} /> {item.commentsCount || 0} Comments
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Stats Widget */}
          <div className="bg-white p-5 rounded-2xl border border-hairline shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-pink-600" /> Culture Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-wash/60 p-3 rounded-xl text-center">
                <span className="text-[10px] text-muted block">Total Posts</span>
                <span className="text-xl font-bold text-ink">{feed.length}</span>
              </div>
              <div className="bg-wash/60 p-3 rounded-xl text-center">
                <span className="text-[10px] text-muted block">High Fives</span>
                <span className="text-xl font-bold text-pink-600">{totalHighFives}</span>
              </div>
            </div>
          </div>

          {/* Celebrations Widget */}
          <div className="bg-white p-5 rounded-2xl border border-hairline shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <PartyPopper size={16} className="text-amber-500" /> Today's Celebrations
            </h3>

            <div className="space-y-3 text-xs">
              {celebrations.map((cel) => (
                <div
                  key={cel.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    cel.type === 'BIRTHDAY'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-purple-50/70 border-purple-200'
                  }`}
                >
                  {cel.type === 'BIRTHDAY' ? (
                    <Cake size={20} className="text-amber-600 shrink-0" />
                  ) : (
                    <Award size={20} className="text-purple-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-ink">{cel.name}</h4>
                    <p className="text-[10px] text-muted">{cel.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
