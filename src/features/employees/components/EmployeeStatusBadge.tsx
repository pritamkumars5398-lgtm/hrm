import Badge from '@/shared/components/Badge'
import type { EmployeeStatus } from '@/services/employeeService'
import { STATUS_LABEL, STATUS_TONE } from '../labels'

export default function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}
