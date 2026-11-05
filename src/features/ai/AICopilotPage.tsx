import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles,
  Bot,
  AlertTriangle,
  TrendingUp,
  Search,
  Send,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  RotateCcw,
  User,
  Zap,
} from 'lucide-react'
import {
  aiService,
  type AiMetrics,
  type AiMessage,
} from '../../services/aiService'

export default function AICopilotPage() {
  const [metrics, setMetrics] = useState<AiMetrics | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [asking, setAsking] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [m, hist] = await Promise.all([
        aiService.getMetrics(),
        aiService.getHistory(),
      ])
      setMetrics(m)
      setMessages(hist)
    } catch (err: unknown) {
      console.error('Failed to load AI Copilot data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, asking])

  const handleAsk = async (queryText?: string) => {
    const textToSend = (queryText || query).trim()
    if (!textToSend || asking) return

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    }
    setMessages((prev) => [...prev, userMsg])
    setQuery('')

    try {
      setAsking(true)
      const res = await aiService.ask(textToSend)
      const aiMsg: AiMessage = {
        id: res.id,
        sender: 'ai',
        text: res.response,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err: unknown) {
      console.error('AI ask failed:', err)
      const errorMsg: AiMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing your query. Please try again.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setAsking(false)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your AI Copilot conversation history?')) return
    try {
      await aiService.clearHistory()
      await fetchData()
    } catch (err: unknown) {
      console.error('Failed to clear history:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white p-6 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={14} className="animate-pulse" /> Next-Generation AI HR Copilot
          </div>
          <h1 className="text-2xl font-bold font-display">AI Insights, Anomaly Scanner & Policy Assistant</h1>
          <p className="text-slate-300 text-sm mt-1">
            Autonomous payroll auditing, candidate screening match, labor law compliance, and attrition risk prediction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2.5 rounded-xl transition text-xs border border-white/10 cursor-pointer"
            title="Refresh AI insights"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2.5 rounded-xl transition text-xs border border-white/10 cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw size={14} />
            Reset Chat
          </button>
        </div>
      </div>

      {/* AI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-600 font-bold text-xs">
            <span>AI Payroll Audit</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xl font-bold text-ink">
            {metrics ? metrics.payrollAudit.status : '—'}
          </p>
          <p className="text-xs text-muted">
            {metrics ? metrics.payrollAudit.details : 'Loading…'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600 font-bold text-xs">
            <span>Attrition (last 12 months)</span>
            <AlertTriangle size={16} />
          </div>
          <p className="text-xl font-bold text-ink">
            {metrics ? `${metrics.attritionRisk.flaggedCount} Exit(s)` : '—'}
          </p>
          <p className="text-xs text-muted">
            {metrics ? metrics.attritionRisk.driver : 'Loading…'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600 font-bold text-xs">
            <span>Hiring Conversion</span>
            <Sparkles size={16} />
          </div>
          <p className="text-xl font-bold text-ink">
            {metrics ? `${metrics.resumeMatch.ratePercent}% Hired` : '—'}
          </p>
          <p className="text-xs text-muted">
            {metrics ? metrics.resumeMatch.details : 'Loading…'}
          </p>
        </div>
      </div>

      {/* AI Assistant Chat Window */}
      <div className="bg-white rounded-2xl border border-hairline shadow-xs p-5 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-ink flex items-center gap-1.5">
                Emgager AI HR Copilot
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </h3>
              <p className="text-[10px] text-muted">
                Trained on Indian labor law, organizational payroll, and workforce turnover trends
              </p>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-purple-950 uppercase shrink-0">
            Suggested Prompts:
          </span>
          <button
            onClick={() => handleAsk('Who has the highest attrition risk in the company?')}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition whitespace-nowrap cursor-pointer"
          >
            🔍 Who has high attrition risk?
          </button>
          <button
            onClick={() => handleAsk('Summarize August payroll audit and statutory deductions')}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition whitespace-nowrap cursor-pointer"
          >
            💰 Payroll & TDS Audit
          </button>
          <button
            onClick={() => handleAsk('What is our earned leave and maternity leave policy?')}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition whitespace-nowrap cursor-pointer"
          >
            📖 Leave & Maternity Policy
          </button>
          <button
            onClick={() => handleAsk('How are candidate resume matches looking for active jobs?')}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition whitespace-nowrap cursor-pointer"
          >
            🎯 Resume Screening Score
          </button>
        </div>

        {/* Chat Body */}
        <div className="space-y-4 min-h-[300px] max-h-[460px] overflow-y-auto p-2 bg-wash/30 rounded-xl border border-hairline">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-2xl text-xs max-w-xl leading-relaxed whitespace-pre-line shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white font-medium rounded-tr-xs'
                    : 'bg-white text-ink border border-hairline rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {asking && (
            <div className="flex justify-start">
              <div className="p-3.5 rounded-2xl bg-white border border-hairline text-xs text-muted flex items-center gap-2 shadow-2xs">
                <Sparkles size={14} className="animate-spin text-purple-600" />
                <span>AI Copilot is analyzing workforce metrics...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI: 'Who has the highest attrition risk?' or 'What is our maternity leave policy?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-hairline focus:border-purple-600 focus:outline-none text-xs bg-white"
          />
          <button
            type="submit"
            disabled={asking || !query.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Send size={14} /> Ask AI
          </button>
        </form>
      </div>
    </div>
  )
}
