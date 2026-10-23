import { useState } from 'react'
import { Sparkles, Bot, AlertTriangle, TrendingUp, Search, Send, ShieldAlert, CheckCircle2, FileCheck } from 'lucide-react'

export default function AICopilotPage() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello Priya! I am your AI HR Copilot. I have analyzed your organization data today:\n- 0 Payroll anomalies detected for August\n- 2 Employees flagged with high turnover risk due to overtime trends\n- Attendance anomaly rate: 1.2%\n\nHow can I assist you?' }
  ])

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const userText = query
    setMessages(prev => [...prev, { sender: 'user', text: userText }])
    setQuery('')

    setTimeout(() => {
      let aiResp = "Based on company HR policy and historical data: All employees with > 12 months tenure are eligible for 18 days Earned Leave. Encashment limit is 30 days per calendar year."
      if (userText.toLowerCase().includes('attrition') || userText.toLowerCase().includes('turnover')) {
        aiResp = "🤖 Attrition Insight: Engineering department shows 8.4% turnover risk. Main driver: High weekend overtime in project 'Enterprise SaaS Portal'. Recommended action: Re-balance task allocation."
      } else if (userText.toLowerCase().includes('payroll') || userText.toLowerCase().includes('salary')) {
        aiResp = "🤖 Payroll Audit: Total gross payout for August is ₹28,45,000. All TDS, PF, and ESIC deductions match Section 192 statutory limits. 0 errors found."
      }
      setMessages(prev => [...prev, { sender: 'ai', text: aiResp }])
    }, 600)
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
          <p className="text-slate-300 text-sm mt-1">Autonomous payroll auditing, candidate screening match, and attrition risk prediction.</p>
        </div>
      </div>

      {/* AI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600 font-bold text-xs">
            <span>AI Payroll Audit</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xl font-bold text-ink">0 Errors Found</p>
          <p className="text-xs text-muted">Scanned 42 employee payslips against tax slabs & attendance records.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600 font-bold text-xs">
            <span>Attrition Risk Monitor</span>
            <AlertTriangle size={16} />
          </div>
          <p className="text-xl font-bold text-ink">2 Employees Flagged</p>
          <p className="text-xs text-muted">Driven by high overtime & delayed performance reviews.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600 font-bold text-xs">
            <span>AI Resume Match Rate</span>
            <Sparkles size={16} />
          </div>
          <p className="text-xl font-bold text-ink">92.4% Average</p>
          <p className="text-xs text-muted">Parsed 89 candidate resumes for Senior Engineer position.</p>
        </div>
      </div>

      {/* AI Assistant Chat Window */}
      <div className="bg-white rounded-2xl border border-hairline shadow-sm p-4 space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          <div className="size-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-ink">Emgager AI HR Copilot</h3>
            <p className="text-[10px] text-muted">Ask anything about company policies, turnover analytics, or payroll rules</p>
          </div>
        </div>

        <div className="space-y-3 min-h-[250px] max-h-[350px] overflow-y-auto p-2">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-xl text-xs max-w-lg ${
                m.sender === 'user' ? 'bg-purple-600 text-white font-medium' : 'bg-wash text-ink border border-hairline'
              }`}>
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI: 'Who has the highest attrition risk?' or 'What is our maternity leave policy?'"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-hairline focus:border-purple-500 focus:outline-none"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
