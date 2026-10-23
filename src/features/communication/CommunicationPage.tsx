import { useState } from 'react'
import { MessageSquare, Send, PhoneCall, Bot, Bell, ShieldCheck, Smartphone } from 'lucide-react'

type Message = {
  id: string
  sender: string
  text: string
  time: string
  isBot?: boolean
}

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp-bot'>('chat')
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 'm-1', sender: 'Rahul Mehta', text: 'Hey Priya, has the August payroll audit completed?', time: '10:14 AM' },
    { id: 'm-2', sender: 'Priya Sharma', text: 'Yes! Finalized all 42 employee payslips. Sent to bank disbursal portal.', time: '10:16 AM' },
  ])
  const [chatInput, setChatInput] = useState('')

  const [botMessages, setBotMessages] = useState<Message[]>([
    { id: 'b-1', sender: 'Emgager WhatsApp Bot 🤖', text: 'Namaste Priya! Welcome to Emgager HR WhatsApp Assistant. You can reply with:\n1. Apply Leave\n2. Download Payslip\n3. Punch Attendance', time: '10:00 AM', isBot: true }
  ])
  const [botInput, setBotInput] = useState('')

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const msg: Message = {
      id: `m-${Date.now()}`,
      sender: 'Priya Sharma (You)',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setChatMessages([...chatMessages, msg])
    setChatInput('')
  }

  const handleSendBot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!botInput.trim()) return
    const userMsg: Message = {
      id: `b-${Date.now()}`,
      sender: 'You (WhatsApp)',
      text: botInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    let replyText = "I didn't quite get that. Reply '1' for Leave, '2' for Payslip, or '3' for Punch In."
    const lower = botInput.toLowerCase()
    if (lower.includes('1') || lower.includes('leave')) {
      replyText = '✅ Leave Request Initiated! Please reply with: "Sick Leave from 10 Aug to 11 Aug"'
    } else if (lower.includes('2') || lower.includes('payslip')) {
      replyText = '📄 Here is your August 2026 Payslip: https://emgager.work/payslip/aug2026.pdf'
    } else if (lower.includes('3') || lower.includes('punch')) {
      replyText = '⏰ Punch Recorded via WhatsApp GPS at 10:22 AM! Location: Tech Park Campus.'
    }

    const botReply: Message = {
      id: `b-${Date.now() + 1}`,
      sender: 'Emgager WhatsApp Bot 🤖',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBot: true
    }

    setBotMessages([...botMessages, userMsg, botReply])
    setBotInput('')
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-teal-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare size={14} /> Internal Chat & Automated WhatsApp HR Bot
          </div>
          <h1 className="text-2xl font-bold font-display">Communication & Broadcast Center</h1>
          <p className="text-slate-300 text-sm mt-1">Real-time team messaging and automated WhatsApp HR self-service bot.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-hairline">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'chat' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          Internal Team Chat
        </button>
        <button
          onClick={() => setActiveTab('whatsapp-bot')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'whatsapp-bot' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          <Smartphone size={14} className="inline mr-1.5" /> WhatsApp HR Assistant Bot
        </button>
      </div>

      {/* Tab 1: Internal Chat */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-hairline bg-wash/40 font-bold text-xs text-ink flex items-center justify-between">
            <span>#general-announcements & HR Workspace</span>
            <span className="text-emerald-600 text-[11px] font-semibold">● 14 Online</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-ink">{msg.sender}</span>
                  <span className="text-[10px] text-muted">{msg.time}</span>
                </div>
                <p className="bg-wash/60 p-3 rounded-xl text-xs text-ink max-w-xl">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-hairline flex gap-2">
            <input
              type="text"
              placeholder="Type message to team..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-hairline focus:border-teal-500 focus:outline-none"
            />
            <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: WhatsApp Bot */}
      {activeTab === 'whatsapp-bot' && (
        <div className="bg-emerald-950/5 border border-emerald-500/20 rounded-2xl p-4 max-w-xl mx-auto space-y-4">
          <div className="bg-emerald-800 text-white p-4 rounded-xl flex items-center gap-3">
            <Bot size={24} />
            <div>
              <h3 className="font-bold text-sm">Emgager WhatsApp HR Bot</h3>
              <p className="text-[11px] text-emerald-200">Official WhatsApp Verified Self-Service</p>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
            {botMessages.map(b => (
              <div key={b.id} className={`flex flex-col ${b.isBot ? 'items-start' : 'items-end'}`}>
                <div className={`p-3 rounded-xl text-xs max-w-sm ${
                  b.isBot ? 'bg-white text-ink shadow-sm border border-emerald-100' : 'bg-emerald-600 text-white font-medium'
                }`}>
                  <p className="whitespace-pre-line">{b.text}</p>
                  <span className={`block text-[9px] mt-1 ${b.isBot ? 'text-muted' : 'text-emerald-100'}`}>{b.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendBot} className="flex gap-2">
            <input
              type="text"
              placeholder="Reply '1' for Leave, '2' for Payslip, '3' for Punch..."
              value={botInput}
              onChange={e => setBotInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-emerald-300 focus:border-emerald-600 focus:outline-none bg-white"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
