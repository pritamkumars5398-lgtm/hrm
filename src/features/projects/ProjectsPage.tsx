import { useState } from 'react'
import { FolderKanban, Plus, Clock, CheckCircle2, Users, Calendar, ArrowUpRight, Filter } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'

type Project = {
  id: string
  title: string
  client: string
  status: 'In Progress' | 'Completed' | 'Review' | 'Planning'
  deadline: string
  progress: number
  teamMembers: string[]
  tasksCount: { total: number; done: number }
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    title: 'HRMS Mobile App Redesign',
    client: 'Internal Enterprise',
    status: 'In Progress',
    deadline: '28 Nov 2026',
    progress: 68,
    teamMembers: ['Aakash Kumar', 'Ritik Verma', 'Nitin Kumar'],
    tasksCount: { total: 24, done: 16 }
  },
  {
    id: 'prj-2',
    title: 'Payment Gateway Integration & Audit',
    client: 'Fintech Corp',
    status: 'Review',
    deadline: '15 Dec 2026',
    progress: 90,
    teamMembers: ['Rohit Jain', 'Salman Khan'],
    tasksCount: { total: 14, done: 13 }
  },
  {
    id: 'prj-3',
    title: 'Cloud Infrastructure Migration (AWS to GCP)',
    client: 'Global Logistics',
    status: 'Planning',
    deadline: '10 Jan 2027',
    progress: 25,
    teamMembers: ['Aakash Kumar', 'Rohit Kumar'],
    tasksCount: { total: 18, done: 5 }
  }
]

export default function ProjectsPage() {
  const [projects] = useState<Project[]>(INITIAL_PROJECTS)
  const [filter, setFilter] = useState<string>('All')

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Delivery & Milestones</p>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink flex items-center gap-2">
            <FolderKanban className="text-emerald-600" size={26} /> Projects
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Track departmental projects, milestones, client deliverables and team allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface border border-hairline p-1 rounded-xl text-xs font-semibold">
            {['All', 'In Progress', 'Review', 'Planning'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === st ? 'bg-emerald-600 text-white shadow-2xs' : 'text-muted hover:text-ink hover:bg-wash'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Button className="flex items-center gap-1.5 text-xs">
            <Plus size={14} /> New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project) => (
          <Card key={project.id} className="p-5 flex flex-col justify-between hover:shadow-md transition duration-200 border border-hairline/70">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  project.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : project.status === 'Review'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : project.status === 'Planning'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {project.status}
                </span>
                <span className="text-[11.5px] font-medium text-muted flex items-center gap-1">
                  <Calendar size={12} /> {project.deadline}
                </span>
              </div>

              <h3 className="font-bold text-ink text-[15px] leading-snug hover:text-emerald-700 transition cursor-pointer">
                {project.title}
              </h3>
              <p className="text-xs text-muted mt-1 font-medium">{project.client}</p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-muted">
                  <span>Progress</span>
                  <span className="text-ink font-bold">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-wash rounded-full overflow-hidden border border-hairline/60">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Team & Task stats */}
            <div className="mt-5 pt-3.5 border-t border-hairline flex items-center justify-between text-xs text-muted">
              <div className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-muted/80" />
                <span>{project.teamMembers.length} Assignees</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{project.tasksCount.done}/{project.tasksCount.total} Tasks</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

