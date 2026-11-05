import { useState } from 'react'
import { Calendar, Bell, ChevronLeft, ChevronRight, Clock, MapPin, Sparkles } from 'lucide-react'
import Card from '@/shared/components/Card'

type Holiday = {
  id: string
  name: string
  date: string
  day: string
  type: 'National' | 'Festival' | 'Optional'
  description?: string
}

const HOLIDAYS_2026: Holiday[] = [
  { id: '1', name: 'New Year Day', date: '2026-01-01', day: 'Thursday', type: 'Festival' },
  { id: '2', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'National' },
  { id: '3', name: 'Maha Shivratri', date: '2026-02-15', day: 'Sunday', type: 'Festival' },
  { id: '4', name: 'Holi', date: '2026-03-04', day: 'Wednesday', type: 'Festival' },
  { id: '5', name: 'Id-ul-Fitr (Eid)', date: '2026-03-21', day: 'Saturday', type: 'Festival' },
  { id: '6', name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'Festival' },
  { id: '7', name: 'Mahavir Jayanti', date: '2026-04-20', day: 'Monday', type: 'Optional' },
  { id: '8', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National' },
  { id: '9', name: 'Raksha Bandhan', date: '2026-08-28', day: 'Friday', type: 'Festival' },
  { id: '10', name: 'Janmashtami', date: '2026-09-04', day: 'Friday', type: 'Festival' },
  { id: '11', name: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'National' },
  { id: '12', name: 'Dussehra', date: '2026-10-20', day: 'Tuesday', type: 'Festival' },
  { id: '13', name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday', type: 'Festival' },
  { id: '14', name: 'Guru Nanak Jayanti', date: '2026-11-24', day: 'Tuesday', type: 'Festival' },
  { id: '15', name: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'Festival' },
]

export default function HolidayCalendarPage() {
  const [selectedType, setSelectedType] = useState<string>('All')

  const filteredHolidays = selectedType === 'All'
    ? HOLIDAYS_2026
    : HOLIDAYS_2026.filter((h) => h.type === selectedType)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Company Calendar</p>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink flex items-center gap-2">
            <Calendar className="text-emerald-600" size={26} /> Holiday Calendar 2026
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Official company holiday schedule, gazetted leaves and festival celebrations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface border border-hairline p-1 rounded-xl text-xs font-semibold">
          {['All', 'National', 'Festival', 'Optional'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-muted hover:text-ink hover:bg-wash'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Holidays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHolidays.map((holiday) => {
          const dateObj = new Date(holiday.date)
          const monthStr = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase()
          const dayNum = dateObj.getDate()

          const isNational = holiday.type === 'National'
          const isOptional = holiday.type === 'Optional'

          return (
            <Card key={holiday.id} className="p-4 flex items-center gap-4 hover:shadow-sm transition border border-hairline/70">
              <div className={`size-14 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 border ${
                isNational
                  ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                  : isOptional
                  ? 'bg-purple-50 text-purple-800 border-purple-200/60'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-wider">{monthStr}</span>
                <span className="text-xl leading-none font-black">{dayNum}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full border uppercase tracking-wider ${
                    isNational
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : isOptional
                      ? 'bg-purple-100 text-purple-900 border-purple-200'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}>
                    {holiday.type}
                  </span>
                </div>
                <h4 className="font-bold text-[14px] text-ink truncate">{holiday.name}</h4>
                <p className="text-[11.5px] text-muted font-medium">{holiday.day}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

