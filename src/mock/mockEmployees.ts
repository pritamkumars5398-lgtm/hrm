import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'NOTICE' | 'INACTIVE'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'

export type EmploymentEvent = {
  id: string
  date: string
  title: string
  detail: string
}

export type EmployeeDocument = {
  id: string
  name: string
  category: 'Contract' | 'Identity' | 'Certification' | 'Policy'
  uploadedAt: string
  sizeKb: number
}

export type Employee = {
  id: string
  /** Present from day one so Phase 2's tenant isolation costs nothing (Hard Rule 7). */
  organizationId: string
  name: string
  avatarInitials: string
  email: string
  phone: string
  department: string
  designation: string
  status: EmployeeStatus
  employmentType: EmploymentType
  location: string
  joinedAt: string
  managerName: string | null
  /** Another Employee.id in the same company. Not surfaced in the UI yet. */
  managerId?: string | null
  employmentHistory: EmploymentEvent[]
  documents: EmployeeDocument[]
  /**
   * Raw stored fields the backend returns so the edit form can show real values
   * (`name`/`designation`/`location` are display-only). Optional because the mock
   * seed doesn't populate them.
   */
  firstName?: string
  lastName?: string
  employeeId?: string
  homeAddress?: string
}

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Sales',
  'Marketing',
  'Finance',
  'People',
  'Support',
  'Operations',
] as const

export const EMPLOYEE_STATUSES: EmployeeStatus[] = [
  'ACTIVE',
  'ON_LEAVE',
  'PROBATION',
  'NOTICE',
  'INACTIVE',
]

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

type Seed = [
  name: string,
  department: string,
  designation: string,
  status: EmployeeStatus,
  type: EmploymentType,
  location: string,
  joinedAt: string,
  manager: string | null,
]

// Deliberately uneven: a real directory has clustered departments, a few people
// on notice, some on probation. Perfectly uniform mock data hides layout bugs.
const SEEDS: Seed[] = [
  ['Priya Nair', 'People', 'Founder & CEO', 'ACTIVE', 'FULL_TIME', 'London', '2021-02-11', null],
  ['Marta Lindqvist', 'People', 'HR Manager', 'ACTIVE', 'FULL_TIME', 'London', '2022-06-01', 'Priya Nair'],
  ['Samuel Okafor', 'Engineering', 'Engineering Manager', 'ON_LEAVE', 'FULL_TIME', 'Manchester', '2021-09-14', 'Priya Nair'],
  ['Dan Whitfield', 'Sales', 'Account Executive', 'PROBATION', 'FULL_TIME', 'London', '2026-05-04', 'Elena Rossi'],
  ['Elena Rossi', 'Sales', 'Head of Sales', 'ACTIVE', 'FULL_TIME', 'Milan', '2022-01-17', 'Priya Nair'],
  ['Tom Okada', 'Engineering', 'Senior Backend Engineer', 'ACTIVE', 'FULL_TIME', 'Manchester', '2022-03-28', 'Samuel Okafor'],
  ['Aisha Rahman', 'Engineering', 'Frontend Engineer', 'ACTIVE', 'FULL_TIME', 'London', '2023-07-10', 'Samuel Okafor'],
  ['Lucas Meyer', 'Engineering', 'Platform Engineer', 'ACTIVE', 'FULL_TIME', 'Berlin', '2023-02-06', 'Samuel Okafor'],
  ['Chloe Dubois', 'Design', 'Product Designer', 'ACTIVE', 'FULL_TIME', 'Paris', '2022-11-21', 'Priya Nair'],
  ['Noah Bennett', 'Design', 'Design Lead', 'ACTIVE', 'FULL_TIME', 'London', '2021-08-02', 'Priya Nair'],
  ['Ruth Adeyemi', 'Product', 'Product Manager', 'ACTIVE', 'FULL_TIME', 'London', '2022-04-19', 'Priya Nair'],
  ['Marco Silva', 'Product', 'Associate PM', 'PROBATION', 'FULL_TIME', 'Lisbon', '2026-04-13', 'Ruth Adeyemi'],
  ['Hannah Brooks', 'Marketing', 'Content Lead', 'ACTIVE', 'PART_TIME', 'Bristol', '2023-01-09', 'Priya Nair'],
  ['Yusuf Demir', 'Marketing', 'Growth Marketer', 'ACTIVE', 'FULL_TIME', 'London', '2023-09-25', 'Hannah Brooks'],
  ['Grace Liu', 'Finance', 'Financial Controller', 'ACTIVE', 'FULL_TIME', 'London', '2021-11-15', 'Priya Nair'],
  ['Peter Novak', 'Finance', 'Payroll Specialist', 'ACTIVE', 'FULL_TIME', 'Prague', '2022-08-08', 'Grace Liu'],
  ['Sofia Marino', 'Support', 'Support Lead', 'ACTIVE', 'FULL_TIME', 'Milan', '2022-05-30', 'Priya Nair'],
  ['Jonah Clarke', 'Support', 'Support Specialist', 'ACTIVE', 'FULL_TIME', 'Manchester', '2024-02-12', 'Sofia Marino'],
  ['Amira Haddad', 'Support', 'Support Specialist', 'ON_LEAVE', 'FULL_TIME', 'London', '2023-10-02', 'Sofia Marino'],
  ['Ben Carter', 'Operations', 'Operations Manager', 'ACTIVE', 'FULL_TIME', 'London', '2022-02-14', 'Priya Nair'],
  ['Ines Duarte', 'Operations', 'Facilities Coordinator', 'ACTIVE', 'PART_TIME', 'Lisbon', '2024-06-03', 'Ben Carter'],
  ['Kai Tanaka', 'Engineering', 'Staff Engineer', 'ACTIVE', 'FULL_TIME', 'Tokyo', '2021-05-24', 'Samuel Okafor'],
  ['Freya Nilsson', 'Engineering', 'QA Engineer', 'ACTIVE', 'CONTRACT', 'Stockholm', '2024-09-16', 'Samuel Okafor'],
  ['Oscar Lindgren', 'Engineering', 'Junior Engineer', 'PROBATION', 'FULL_TIME', 'Stockholm', '2026-06-01', 'Kai Tanaka'],
  ['Nadia Petrova', 'Design', 'UX Researcher', 'ACTIVE', 'CONTRACT', 'Berlin', '2024-03-11', 'Noah Bennett'],
  ['Rory Gallagher', 'Sales', 'Sales Development Rep', 'ACTIVE', 'FULL_TIME', 'Dublin', '2023-11-06', 'Elena Rossi'],
  ['Mei Chen', 'Sales', 'Account Executive', 'ACTIVE', 'FULL_TIME', 'London', '2023-04-17', 'Elena Rossi'],
  ['Tobias Fischer', 'Sales', 'Account Executive', 'NOTICE', 'FULL_TIME', 'Berlin', '2022-09-05', 'Elena Rossi'],
  ['Leila Karimi', 'Marketing', 'Brand Designer', 'ACTIVE', 'FULL_TIME', 'London', '2024-01-22', 'Hannah Brooks'],
  ['Callum Reid', 'Product', 'Product Analyst', 'ACTIVE', 'FULL_TIME', 'Edinburgh', '2023-06-12', 'Ruth Adeyemi'],
  ['Zara Iqbal', 'People', 'Recruiter', 'ACTIVE', 'FULL_TIME', 'London', '2023-08-14', 'Marta Lindqvist'],
  ['Victor Almeida', 'Finance', 'Accountant', 'ACTIVE', 'FULL_TIME', 'Lisbon', '2023-03-20', 'Grace Liu'],
  ['Hugo Martin', 'Operations', 'Logistics Coordinator', 'INACTIVE', 'CONTRACT', 'Paris', '2022-07-11', 'Ben Carter'],
  ['Sana Malik', 'Engineering', 'Data Engineer', 'ACTIVE', 'FULL_TIME', 'London', '2024-04-08', 'Kai Tanaka'],
  ['Ethan Wallace', 'Engineering', 'Site Reliability Engineer', 'ACTIVE', 'FULL_TIME', 'Manchester', '2023-05-15', 'Samuel Okafor'],
  ['Julia Sorenson', 'Design', 'Product Designer', 'NOTICE', 'FULL_TIME', 'Copenhagen', '2022-10-24', 'Noah Bennett'],
  ['Adam Foster', 'Support', 'Support Specialist', 'ACTIVE', 'PART_TIME', 'Bristol', '2024-08-19', 'Sofia Marino'],
  ['Nina Kowalski', 'People', 'People Operations', 'ACTIVE', 'FULL_TIME', 'Warsaw', '2024-05-06', 'Marta Lindqvist'],
]

function historyFor(name: string, designation: string, joinedAt: string): EmploymentEvent[] {
  const joinYear = Number(joinedAt.slice(0, 4))
  const events: EmploymentEvent[] = [
    {
      id: `${name}-joined`,
      date: joinedAt,
      title: 'Joined the company',
      detail: `Started as ${designation}.`,
    },
  ]

  if (joinYear <= 2023) {
    events.unshift({
      id: `${name}-promo`,
      date: `${joinYear + 2}-04-01`,
      title: 'Promotion',
      detail: `Promoted to ${designation}.`,
    })
  }

  return events
}

function documentsFor(name: string): EmployeeDocument[] {
  return [
    {
      id: `${name}-contract`,
      name: 'Employment contract.pdf',
      category: 'Contract',
      uploadedAt: '2024-01-12',
      sizeKb: 248,
    },
    {
      id: `${name}-id`,
      name: 'Passport scan.pdf',
      category: 'Identity',
      uploadedAt: '2024-01-12',
      sizeKb: 1104,
    },
    {
      id: `${name}-policy`,
      name: 'Handbook acknowledgement.pdf',
      category: 'Policy',
      uploadedAt: '2024-02-03',
      sizeKb: 96,
    },
  ]
}

export const mockEmployees: Employee[] = SEEDS.map(
  ([name, department, designation, status, employmentType, location, joinedAt, managerName], i) => ({
    id: `emp-${String(i + 1).padStart(3, '0')}`,
    organizationId: MOCK_ORGANIZATION_ID,
    name,
    avatarInitials: initials(name),
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@alderway.com`,
    phone: `+44 7700 9${String(10000 + i).slice(0, 5)}`,
    department,
    designation,
    status,
    employmentType,
    location,
    joinedAt,
    managerName,
    employmentHistory: historyFor(name, designation, joinedAt),
    documents: documentsFor(name),
  }),
)
