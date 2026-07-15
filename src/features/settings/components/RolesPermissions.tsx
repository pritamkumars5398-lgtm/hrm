import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/shared/components/Card'

export default function RolesPermissions() {
  return (
    <div>
      <div>
        <h2 className="text-[15px] font-semibold">Roles & Permissions</h2>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
          Manage access control for your workspace.
        </p>
      </div>

      <Card flush className="mt-5 p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-wash mb-4">
          <Info size={20} className="text-pine" />
        </div>
        <h3 className="text-[15px] font-medium text-ink mb-2">
          Permissions are now managed per-member
        </h3>
        <p className="text-[13px] text-muted max-w-sm mx-auto mb-6">
          The global role matrix has been replaced with granular, per-user permissions. 
          You can now adjust exactly what each individual person can see and do.
        </p>
        <Link 
          to="/dashboard/team" 
          className="inline-flex h-9 items-center justify-center rounded-ctl bg-pine px-4 text-[13px] font-medium text-white transition-colors hover:bg-pine-deep"
        >
          Manage Team Permissions
        </Link>
      </Card>
    </div>
  )
}
