import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MessageSquare,
  Send,
  Smartphone,
  Trash2,
  RefreshCw,
  AlertCircle,
  Bot,
  User,
  CheckCheck,
  RotateCcw,
} from 'lucide-react'
import {
  communicationService,
  type ChatMessage,
  type WhatsAppMessage,
} from '../../services/communicationService'

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp-bot'>('chat')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [botMessages, setBotMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [chatInput, setChatInput] = useState('')
  const [botInput, setBotInput] = useState('')
  const [sending, setSending] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const botEndRef = useRef<HTMLDivElement>(null)

  const fetchChat = useCallback(async () => {
    try {
      const data = await communicationService.getChat()
      setChatMessages(data)
    } catch (err: unknown) {
      console.error('Failed to load chat:', err)
      setError('Failed to fetch team messages.')
    }
  }, [])

  const fetchWhatsApp = useCallback(async () => {
    try {
      const data = await communicationService.getWhatsApp()
      setBotMessages(data)
    } catch (err: unknown) {
      console.error('Failed to load WhatsApp bot chat:', err)
      setError('Failed to fetch WhatsApp assistant conversation.')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)
      await Promise.all([fetchChat(), fetchWhatsApp()])
      setLoading(false)
    }
    init()
  }, [fetchChat, fetchWhatsApp])

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      botEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, botMessages, activeTab])

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || sending) return
    try {
      setSending(true)
      const newMsg = await communicationService.sendChat(chatInput.trim())
      setChatMessages((prev) => [...prev, newMsg])
      setChatInput('')
    } catch (err: unknown) {
      console.error('Failed to send chat message:', err)
      alert('Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteChat = async (id: string) => {
    try {
      await communicationService.deleteChat(id)
      setChatMessages((prev) => prev.filter((m) => m.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete message:', err)
    }
  }

  const handleSendBot = async (textToSend?: string) => {
    const text = (textToSend || botInput).trim()
    if (!text || sending) return
    try {
      setSending(true)
      setBotInput('')
      const { userMessage, botReply } = await communicationService.sendWhatsApp(text)
      setBotMessages((prev) => [...prev, userMessage, botReply])
    } catch (err: unknown) {
      console.error('Failed to communicate with WhatsApp bot:', err)
      alert('Failed to send message to WhatsApp bot.')
    } finally {
      setSending(false)
    }
  }

  const handleClearWhatsApp = async () => {
    if (!confirm('Reset WhatsApp bot conversation history?')) return
    try {
      await communicationService.clearWhatsApp()
      await fetchWhatsApp()
    } catch (err: unknown) {
      console.error('Failed to reset conversation:', err)
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl border border-teal-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare size={14} /> Team Messaging & Automated WhatsApp Bot
          </div>
          <h1 className="text-2xl font-bold font-display">Communication & Broadcast Center</h1>
          <p className="text-slate-300 text-sm mt-1">
            Direct team collaboration chat and automated 24/7 WhatsApp self-service assistant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === 'chat') fetchChat()
              else fetchWhatsApp()
            }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2 rounded-xl transition text-xs border border-white/10 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-hairline shadow-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-muted hover:bg-wash'
          }`}
        >
          <MessageSquare size={14} />
          Internal Team Chat ({chatMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp-bot')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'whatsapp-bot'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted hover:bg-wash'
          }`}
        >
          <Smartphone size={14} />
          WhatsApp HR Assistant Bot (Live)
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-hairline shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="px-5 py-3 border-b border-hairline bg-wash/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-ink"># general-team-broadcast</h3>
              <p className="text-[10px] text-muted">Company-wide real-time collaboration</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● Online
            </span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="group flex items-start gap-3">
                <div className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  {msg.sender.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 bg-wash/30 p-3 rounded-2xl border border-hairline relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink">{msg.sender}</span>
                      {msg.senderRole && (
                        <span className="text-[10px] text-muted">({msg.senderRole})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{formatTime(msg.createdAt)}</span>
                      <button
                        onClick={() => handleDeleteChat(msg.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-ink leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSendChat}
            className="p-3 border-t border-hairline bg-wash/20 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message to the team..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-hairline focus:border-slate-800 focus:outline-none text-xs bg-white"
            />
            <button
              type="submit"
              disabled={sending || !chatInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}

      {/* WhatsApp Bot Tab */}
      {activeTab === 'whatsapp-bot' && (
        <div className="bg-white rounded-2xl border border-hairline shadow-xs overflow-hidden flex flex-col h-[560px]">
          {/* WhatsApp Header */}
          <div className="px-5 py-3 border-b border-hairline bg-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-xs">Emgager WhatsApp HR Assistant</h3>
                <p className="text-[10px] text-emerald-200">Verified Business Account • Online</p>
              </div>
            </div>
            <button
              onClick={handleClearWhatsApp}
              className="text-[11px] font-semibold text-emerald-100 hover:text-white flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw size={12} /> Reset Chat
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-emerald-900 uppercase shrink-0">
              Quick Triggers:
            </span>
            <button
              onClick={() => handleSendBot('1')}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              1. Apply Leave
            </button>
            <button
              onClick={() => handleSendBot('2')}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              2. Download Payslip
            </button>
            <button
              onClick={() => handleSendBot('3')}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap cursor-pointer shadow-2xs"
            >
              3. Punch Attendance
            </button>
          </div>

          {/* WhatsApp Messages Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#e5ddd5]/30">
            {botMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[75%] p-3.5 rounded-2xl shadow-xs text-xs space-y-1 ${
                    msg.isBot
                      ? 'bg-white text-ink border border-slate-200 rounded-tl-xs'
                      : 'bg-emerald-600 text-white rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] ${
                      msg.isBot ? 'text-slate-400' : 'text-emerald-100'
                    }`}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {!msg.isBot && <CheckCheck size={12} className="text-sky-300" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={botEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendBot()
            }}
            className="p-3 border-t border-hairline bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Reply '1' for Leave, '2' for Payslip, '3' for Punch, or type a query..."
              value={botInput}
              onChange={(e) => setBotInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-hairline focus:border-emerald-600 focus:outline-none text-xs bg-wash/30"
            />
            <button
              type="submit"
              disabled={sending || !botInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
