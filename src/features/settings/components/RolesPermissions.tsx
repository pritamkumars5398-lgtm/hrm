import { Check, Info, Lock, RotateCcw } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import {
  ALWAYS_GRANTED,
  NAV_ITEMS,
  canAccess,
  type ModuleKey,
} from '@/shared/config/navigation'
import type { Role } from '@/services/authService'
import { usePermissionsStore } from '../store/permissionsStore'

const ROLES: Role[] = ['OWNER', 'HR', 'MANAGER']
const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  HR: 'HR',
  MANAGER: 'Manager',
}

export default function RolesPermissions() {
  const { matrix, toggle, reset, isDefault } = usePermissionsStore()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold">Roles & Permissions</h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">
            Decide which modules each role can open. Changes take effect immediately — the
            sidebar and the URLs a role can reach both follow this table.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={reset} disabled={isDefault()}>
          <RotateCcw size={14} />
          Reset to defaults
        </Button>
      </div>

      <Card flush className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-hairline bg-wash">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-[12px] font-semibold text-muted"
                >
                  Module
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role}
                    scope="col"
                    className="px-4 py-2.5 text-center text-[12px] font-semibold text-muted"
                  >
                    {ROLE_LABEL[role]}
                    {role === 'OWNER' && (
                      <Lock
                        size={11}
                        className="ml-1 inline text-muted"
                        aria-label="locked"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {NAV_ITEMS.map((item) => {
                const mandatory = ALWAYS_GRANTED.includes(item.key as ModuleKey)

                return (
                  <tr key={item.key} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} className="shrink-0 text-muted" aria-hidden="true" />
                        <span className="text-[13.5px] font-medium">{item.label}</span>
                        {mandatory && <Badge tone="neutral">Always on</Badge>}
                      </div>
                    </td>

                    {ROLES.map((role) => {
                      const granted = canAccess(matrix, role, item.key)
                      // Owner is locked (they'd lock themselves out); Dashboard is mandatory.
                      const locked = role === 'OWNER' || mandatory

                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={granted}
                            aria-label={`${ROLE_LABEL[role]} can access ${item.label}`}
                            disabled={locked}
                            onClick={() => toggle(role, item.key)}
                            className={`inline-flex size-6 items-center justify-center rounded-[5px] border transition-colors ${
                              granted
                                ? 'border-pine bg-pine text-white'
                                : 'border-hairline-strong bg-surface hover:border-pine'
                            } ${locked ? 'cursor-not-allowed opacity-55' : ''}`}
                          >
                            {granted && <Check size={13} strokeWidth={3} />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex gap-2.5 rounded-ctl border border-hairline bg-wash p-3.5">
        <Info size={15} className="mt-px shrink-0 text-muted" aria-hidden="true" />
        <div className="text-[12.5px] leading-relaxed text-muted">
          <p>
            <span className="font-medium text-ink">The Owner row is locked.</span> An owner who
            revoked their own Settings access would be locked out of the only screen that could
            restore it. Dashboard is always on for the same reason — it is every role's landing
            page.
          </p>
          <p className="mt-2">
            In this prototype the matrix is stored in your browser. In Phase 2 it moves to the
            backend, where the server refuses the request rather than the UI hiding a link.
          </p>
        </div>
      </div>
    </div>
  )
}
