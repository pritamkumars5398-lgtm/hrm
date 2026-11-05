import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Bot,
  Send,
  X,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Zap,
  TrendingUp,
} from 'lucide-react'
import {
  aiService,
  type AiMetrics,
  type AiMessage,
} from '@/services/aiService'
import { useCopilotDrawer } from './copilotStore'

export default function CopilotSidebarDrawer() {
  const { isOpen, closeCopilot } = useCopilotDrawer()
  const [metrics, setMetrics] = useState<AiMetrics | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
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
    if (isOpen) {
      void fetchData()
    }
  }, [isOpen, fetchData])

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, asking, isOpen])

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

  const handleClear = async () => {
    if (!confirm('Clear AI Copilot chat history?')) return
    try {
      await aiService.clearHistory()
      await fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeCopilot}
            className="absolute inset-0 bg-ink/25 backdrop-blur-2xs"
            aria-hidden="true"
          />

          {/* Right Slide-in Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="HR AI Copilot"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface border-l border-hairline shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-4 sm:px-5 bg-paper">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-ctl bg-pine-tint text-pine flex items-center justify-center font-bold">
                  <Sparkles size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-ink">HR AI Copilot</h3>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">Intelligent HR Assistant & Analytics</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-ctl text-muted hover:text-ink hover:bg-wash transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={closeCopilot}
                  aria-label="Close HR Copilot"
                  className="p-1.5 rounded-ctl text-muted hover:text-ink hover:bg-wash transition cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar (Collapsible Summary) */}
            {metrics && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-wash/40 border-b border-hairline text-xs">
                <div className="bg-white p-2.5 rounded-ctl border border-hairline">
                  <span className="text-[10px] text-muted uppercase font-bold block">Payroll Audit</span>
                  <span className="text-xs font-bold text-emerald-700">{metrics.payrollAudit.status}</span>
                </div>
                <div className="bg-white p-2.5 rounded-ctl border border-hairline">
                  <span className="text-[10px] text-muted uppercase font-bold block">Attrition Risk</span>
                  <span className="text-xs font-bold text-rose-700">
                    {metrics.attritionRisk.flaggedCount} Exit Flagged
                  </span>
                </div>
              </div>
            )}

            {/* Prompt Suggestion Chips */}
            <div className="px-3 pt-2 pb-1 border-b border-hairline/60 bg-paper/60 overflow-x-auto flex items-center gap-1.5 text-[11px] no-scrollbar">
              <button
                type="button"
                onClick={() => handleAsk('Who has the highest attrition risk in the company?')}
                className="shrink-0 px-2.5 py-1 rounded-full bg-wash hover:bg-hairline text-ink border border-hairline transition cursor-pointer"
              >
                🔍 Attrition Risk?
              </button>
              <button
                type="button"
                onClick={() => handleAsk('Summarize August payroll audit and statutory deductions')}
                className="shrink-0 px-2.5 py-1 rounded-full bg-wash hover:bg-hairline text-ink border border-hairline transition cursor-pointer"
              >
                💰 Payroll Audit
              </button>
              <button
                type="button"
                onClick={() => handleAsk('What is our earned leave and maternity leave policy?')}
                className="shrink-0 px-2.5 py-1 rounded-full bg-wash hover:bg-hairline text-ink border border-hairline transition cursor-pointer"
              >
                📖 Leave Policy
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-wash/20">
              {loading && messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted">
                  <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-pine" />
                  Connecting to HR Copilot...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted space-y-1">
                  <Bot size={28} className="mx-auto text-pine mb-1" />
                  <p className="font-bold text-ink">Ask anything about HR & Staff</p>
                  <p className="text-[11px]">
                    I can query policies, analyze payroll runs, check attrition trends, and draft HR emails.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-card text-xs max-w-[85%] leading-relaxed whitespace-pre-line shadow-2xs ${
                        m.sender === 'user'
                          ? 'bg-pine text-white rounded-tr-xs'
                          : 'bg-white text-ink border border-hairline rounded-tl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))
              )}

              {asking && (
                <div className="flex justify-start">
                  <div className="p-2.5 rounded-card bg-white border border-hairline text-xs text-muted flex items-center gap-2 shadow-2xs">
                    <Sparkles size={13} className="animate-spin text-pine" />
                    <span>Analyzing HR data...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Footer Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAsk()
              }}
              className="p-3 border-t border-hairline bg-paper flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask HR AI Copilot…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-ctl border border-hairline bg-surface text-xs text-ink focus:border-pine focus:outline-none"
              />
              <button
                type="submit"
                disabled={asking || !query.trim()}
                className="px-3.5 py-2 rounded-ctl bg-pine hover:bg-pine-deep text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

