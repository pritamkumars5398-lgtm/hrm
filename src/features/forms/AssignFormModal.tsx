import React, { useState } from 'react';
import { formsApi } from '@/services/forms';
import { X, Send, Calendar, Users, Building2 } from 'lucide-react';

interface AssignFormModalProps {
  formId: string;
  formTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

export const AssignFormModal: React.FC<AssignFormModalProps> = ({
  formId,
  formTitle,
  isOpen,
  onClose,
  onAssigned,
}) => {
  const [targetType, setTargetType] = useState<'all' | 'department'>('all');
  const [department, setDepartment] = useState('IT');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await formsApi.assignForm(formId, {
        assignAll: targetType === 'all',
        department: targetType === 'department' ? department : undefined,
        dueDate: dueDate || undefined,
      });

      if (onAssigned) onAssigned();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to assign form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Assign Form</h3>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{formTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">Assign To</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                  targetType === 'all'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-slate-300'
                }`}
              >
                <Users className="w-4 h-4" /> All Employees
              </button>

              <button
                type="button"
                onClick={() => setTargetType('department')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                  targetType === 'department'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4" /> Department
              </button>
            </div>
          </div>

          {targetType === 'department' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Select Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Assigning...' : 'Assign Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
