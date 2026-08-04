export interface AbacSubject {
  userId: string;
  employeeId?: string;
  department?: string;
  managerId?: string;
  permissions: string[];
}

export interface AbacResource {
  type: 'Form' | 'FormResponse' | 'Employee' | 'Document' | 'LeaveRequest' | 'Attendance';
  id?: string;
  createdByUserId?: string;
  employeeId?: string;
  department?: string;
  status?: string;
  dueDate?: Date | string | null;
  isPublic?: boolean;
}

export type AbacAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SUBMIT' | 'APPROVE' | 'ASSIGN';

export function evaluateAbac(
  subject: AbacSubject | null | undefined,
  action: AbacAction,
  resource: AbacResource
): boolean {
  if (!subject) return false;

  // 1. Super Admin / Owner Wildcard override
  if (subject.permissions && subject.permissions.includes('*')) {
    return true;
  }

  // 2. Attribute-Based Rules Evaluation
  switch (resource.type) {
    case 'Form': {
      if (action === 'CREATE' || action === 'UPDATE' || action === 'DELETE') {
        if (resource.createdByUserId && resource.createdByUserId === subject.userId) {
          return true;
        }
        return (
          subject.permissions.includes('forms.manage') ||
          subject.permissions.includes('forms.*')
        );
      }
      if (action === 'READ') {
        if (resource.isPublic) return true;
        if (resource.status === 'PUBLISHED') return true;
        if (resource.createdByUserId === subject.userId) return true;
        return (
          subject.permissions.includes('forms.view') ||
          subject.permissions.includes('forms.manage') ||
          subject.permissions.includes('forms.*')
        );
      }
      if (action === 'ASSIGN') {
        return (
          subject.permissions.includes('forms.manage') ||
          subject.permissions.includes('forms.*')
        );
      }
      break;
    }

    case 'FormResponse': {
      if (action === 'SUBMIT') {
        return resource.status === 'PUBLISHED';
      }
      if (action === 'READ') {
        if (resource.employeeId && resource.employeeId === subject.employeeId) return true;
        if (
          resource.department &&
          resource.department === subject.department &&
          (subject.permissions.includes('forms.view') || subject.permissions.includes('team.view'))
        ) {
          return true;
        }
        return (
          subject.permissions.includes('forms.view') ||
          subject.permissions.includes('forms.manage') ||
          subject.permissions.includes('forms.*')
        );
      }
      if (action === 'APPROVE') {
        if (subject.employeeId && resource.employeeId && subject.employeeId === resource.employeeId) {
          return false;
        }
        return (
          subject.permissions.includes('forms.manage') ||
          subject.permissions.includes('forms.*') ||
          subject.permissions.includes('leave.approve')
        );
      }
      break;
    }

    case 'Employee': {
      if (action === 'READ') {
        if (resource.employeeId === subject.employeeId) return true;
        return (
          subject.permissions.includes('employees.view') ||
          subject.permissions.includes('employees.manage') ||
          subject.permissions.includes('employees.*')
        );
      }
      if (action === 'UPDATE' || action === 'DELETE' || action === 'CREATE') {
        return (
          subject.permissions.includes('employees.manage') ||
          subject.permissions.includes('employees.*')
        );
      }
      break;
    }
  }

  return false;
}
