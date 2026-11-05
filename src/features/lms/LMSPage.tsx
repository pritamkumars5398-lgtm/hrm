import { useState, useEffect } from 'react'
import {
  GraduationCap,
  Play,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Plus,
  Search,
  X,
  Trash2,
} from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { lmsService, type Course } from '@/services/lmsService'
import { useAuthStore } from '@/features/auth/store/authStore'
import CertificateDocument from './CertificateDocument'

export default function LMSPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'mandatory' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null)
  const userName = useAuthStore((s) => s.user?.name ?? 'Employee')

  // New course form
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<Course['category']>('Compliance')
  const [newDuration, setNewDuration] = useState(60)
  const [newInstructor, setNewInstructor] = useState('')
  const [newMandatory, setNewMandatory] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await lmsService.getCourses()
      setCourses(data)
    } catch (err) {
      console.warn('LMS load fallback', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStartCourse = async (id: string) => {
    try {
      const updated = await lmsService.updateProgress(id, 25)
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)))
      if (updated.progressPercent === 100) {
        setCertificateCourse(updated)
      }
    } catch (err) {
      console.error('Failed to update course progress', err)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || submitting) return

    setSubmitting(true)
    try {
      const created = await lmsService.createCourse({
        title: newTitle.trim(),
        category: newCategory,
        durationMins: Number(newDuration),
        instructor: newInstructor.trim() || 'HR Training Desk',
        isMandatory: newMandatory,
      })

      setCourses([...courses, created])
      setNewTitle('')
      setNewInstructor('')
      setShowAddModal(false)
    } catch (err) {
      console.error('Failed to create course', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Delete course "${title}"?`)) return
    try {
      await lmsService.deleteCourse(id)
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Failed to delete course', err)
    }
  }

  const filtered = courses.filter((c) => {
    if (activeTab === 'mandatory') return c.isMandatory
    if (activeTab === 'completed') return c.progressPercent === 100
    return true
  })

  const completedCount = courses.filter((c) => c.progressPercent === 100).length
  const mandatoryCount = courses.filter((c) => c.isMandatory).length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap size={14} /> LMS Learning & Certification Academy
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Upskilling & Compliance Training</h1>
          <p className="text-slate-300 text-sm mt-1">
            Video courses, mandatory certifications, quizzes, and skill progress tracking.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer text-xs"
          >
            <Plus size={16} /> Add Training Course
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Courses Enrolled</span>
          <p className="text-2xl font-bold text-ink mt-1">{courses.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Active Learning Catalog</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Certificates Earned</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Verifiable Digital Badges
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Mandatory Compliance</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{mandatoryCount} Required</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">
            POSH & ISO 27001 Track
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-hairline">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('mandatory')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'mandatory' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          Mandatory Compliance ({mandatoryCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'completed' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
          }`}
        >
          Completed Certifications ({completedCount})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-white p-5 rounded-2xl border border-hairline shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-wash text-ink border border-hairline">
                  {course.category}
                </span>
                <div className="flex items-center gap-2">
                  {course.isMandatory && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Mandatory
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-ink mt-3">{course.title}</h3>
              <p className="text-xs text-muted mt-1">Instructor: {course.instructor}</p>
              {course.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted mt-3">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {course.durationMins} Mins
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen size={13} /> Interactive Modules
                </span>
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
                <button
                  onClick={() => setCertificateCourse(course)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-2 rounded-xl border border-emerald-200 text-xs transition cursor-pointer"
                >
                  <Award size={15} /> View Verified Certificate
                </button>
              ) : (
                <button
                  onClick={() => handleStartCourse(course.id)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  <Play size={14} /> {course.progressPercent > 0 ? 'Continue Lesson (+25%)' : 'Start Course'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {certificateCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl border-4 border-emerald-500/30 text-center space-y-4 relative">
            <button
              onClick={() => setCertificateCourse(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600">
              Certificate of Completion
            </h2>
            <h3 className="text-xl font-bold font-display text-ink">{certificateCourse.title}</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Successfully completed all training modules, compliance requirements, and quizzes.
            </p>
            <div className="pt-4 border-t border-hairline flex items-center justify-between text-xs text-muted font-medium">
              <span>Category: {certificateCourse.category}</span>
              <span>Issued: {new Date().toISOString().slice(0, 10)}</span>
            </div>
            <button
              onClick={async () => {
                try {
                  const issuedOn = new Date().toISOString().slice(0, 10)
                  const blob = await pdf(
                    <CertificateDocument
                      recipient={userName}
                      courseTitle={certificateCourse.title}
                      category={certificateCourse.category}
                      issuedOn={issuedOn}
                    />,
                  ).toBlob()
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `certificate-${certificateCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                  URL.revokeObjectURL(url)
                  setCertificateCourse(null)
                } catch {
                  alert('Could not generate the certificate PDF. Please try again.')
                }
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Download PDF Certificate
            </button>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Add New Training Course</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOC2 Type II Security Essentials"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Course['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Compliance">Compliance</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Instructor / Team</label>
                <input
                  type="text"
                  placeholder="e.g. Legal & Compliance Desk"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.checked)}
                  className="size-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <label htmlFor="mandatoryCheck" className="text-xs font-semibold text-ink">
                  Mark as Mandatory Compliance Training
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                >
                  {submitting ? 'Creating...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
