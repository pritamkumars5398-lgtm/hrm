import { useState } from 'react'
import { GraduationCap, Play, Award, CheckCircle, Clock, BookOpen, Plus, Search } from 'lucide-react'

type Course = {
  id: string
  title: string
  category: 'Compliance' | 'Engineering' | 'Management' | 'Security'
  durationMins: number
  progressPercent: number
  isMandatory: boolean
  instructor: string
}

const INITIAL_COURSES: Course[] = [
  { id: 'c-1', title: 'POSH & Workplace Code of Conduct 2026', category: 'Compliance', durationMins: 45, progressPercent: 100, isMandatory: true, instructor: 'Legal & HR Compliance Desk' },
  { id: 'c-2', title: 'ISO 27001 Data Security & Privacy Basics', category: 'Security', durationMins: 60, progressPercent: 65, isMandatory: true, instructor: 'InfoSec Office' },
  { id: 'c-3', title: 'Modern Next.js & React Enterprise Architecture', category: 'Engineering', durationMins: 120, progressPercent: 20, isMandatory: false, instructor: 'Tech Lead - Rahul S.' },
  { id: 'c-4', title: 'People Management & 1-on-1 Feedback Mastery', category: 'Management', durationMins: 90, progressPercent: 0, isMandatory: false, instructor: 'VP People - Ananya V.' },
]

export default function LMSPage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
  const [activeTab, setActiveTab] = useState<'all' | 'mandatory' | 'completed'>('all')

  const handleStartCourse = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, progressPercent: Math.min(100, c.progressPercent + 25) } : c))
  }

  const filtered = courses.filter(c => {
    if (activeTab === 'mandatory') return c.isMandatory
    if (activeTab === 'completed') return c.progressPercent === 100
    return true
  })

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap size={14} /> LMS Learning & Certification Academy
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Upskilling & Compliance Training</h1>
          <p className="text-slate-300 text-sm mt-1">Video courses, mandatory certifications, quizzes, and skill progress tracking.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Courses Enrolled</span>
          <p className="text-2xl font-bold text-ink mt-1">{courses.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Across 4 Learning Paths</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Certificates Earned</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{courses.filter(c => c.progressPercent === 100).length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Verifiable Digital Badges</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Mandatory Compliance</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">100% On-Track</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">2 Required Courses</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-hairline">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('mandatory')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'mandatory' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          Mandatory Compliance ({courses.filter(c => c.isMandatory).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'completed' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          Completed Certifications ({courses.filter(c => c.progressPercent === 100).length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(course => (
          <div key={course.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-wash text-ink border border-hairline">
                  {course.category}
                </span>
                {course.isMandatory && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    Mandatory
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-ink mt-3">{course.title}</h3>
              <p className="text-xs text-muted mt-1">Instructor: {course.instructor}</p>

              <div className="flex items-center gap-3 text-xs text-muted mt-3">
                <span className="flex items-center gap-1"><Clock size={13} /> {course.durationMins} Mins</span>
                <span>•</span>
                <span className="flex items-center gap-1"><BookOpen size={13} /> Video + Quiz</span>
              </div>
            </div>

            <div>
              {/* Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted">Course Completion</span>
                  <span className="text-emerald-600">{course.progressPercent}%</span>
                </div>
                <div className="w-full bg-wash h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>

              {course.progressPercent === 100 ? (
                <button className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl border border-emerald-200 text-xs">
                  <Award size={15} /> Download Verified Certificate
                </button>
              ) : (
                <button
                  onClick={() => handleStartCourse(course.id)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  <Play size={14} /> {course.progressPercent > 0 ? 'Continue Lesson' : 'Start Course'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
