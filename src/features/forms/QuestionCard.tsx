import React from 'react';
import type { FormQuestion, QuestionOption } from '@/services/forms';
import { GripVertical, Trash2, Copy, Plus } from 'lucide-react';

interface QuestionCardProps {
  question: FormQuestion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: FormQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Short Text' },
  { value: 'LONG_TEXT', label: 'Paragraph / Long Text' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone Number' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DATE', label: 'Date' },
  { value: 'TIME', label: 'Time' },
  { value: 'DATETIME', label: 'Date & Time' },
  { value: 'DROPDOWN', label: 'Dropdown Select' },
  { value: 'RADIO', label: 'Multiple Choice (Radio)' },
  { value: 'CHECKBOX', label: 'Checkboxes' },
  { value: 'FILE', label: 'File Upload' },
  { value: 'IMAGE', label: 'Image Upload' },
  { value: 'SIGNATURE', label: 'Digital Signature' },
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
}) => {
  const isChoiceType = ['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(question.fieldType);

  const handleAddOption = () => {
    const currentOpts = question.options || [];
    const newOpt: QuestionOption = {
      id: `opt-${Date.now()}-${currentOpts.length + 1}`,
      label: `Option ${currentOpts.length + 1}`,
      value: `option_${currentOpts.length + 1}`,
      order: currentOpts.length,
    };
    onChange({
      ...question,
      options: [...currentOpts, newOpt],
    });
  };

  const handleUpdateOption = (optId: string, label: string) => {
    const updatedOpts = (question.options || []).map((opt) =>
      opt.id === optId ? { ...opt, label, value: label.toLowerCase().replace(/\s+/g, '_') } : opt,
    );
    onChange({ ...question, options: updatedOpts });
  };

  const handleDeleteOption = (optId: string) => {
    const updatedOpts = (question.options || []).filter((opt) => opt.id !== optId);
    onChange({ ...question, options: updatedOpts });
  };

  return (
    <div
      onClick={onSelect}
      className={`p-6 rounded-2xl border transition-all bg-card ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5'
          : 'border-border hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <GripVertical className="w-5 h-5 cursor-grab active:cursor-grabbing text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider bg-secondary/80 px-2 py-0.5 rounded-md">
            Q{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={question.fieldType}
            onChange={(e) => onChange({ ...question, fieldType: e.target.value as any })}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded focus:ring-primary/20"
            />
            Required
          </label>

          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate Question"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Delete Question"
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Label & Description */}
      <div className="space-y-3">
        <input
          type="text"
          value={question.label}
          onChange={(e) => onChange({ ...question, label: e.target.value })}
          placeholder="Untitled Question"
          className="w-full text-base font-semibold border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent py-1 transition-colors"
        />

        <input
          type="text"
          value={question.description || ''}
          onChange={(e) => onChange({ ...question, description: e.target.value })}
          placeholder="Question description or help text (optional)"
          className="w-full text-xs text-muted-foreground border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent py-0.5 transition-colors"
        />
      </div>

      {/* Choice Options list if Dropdown/Radio/Checkbox */}
      {isChoiceType && (
        <div className="mt-5 space-y-2.5 pt-3 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground">Options</p>
          {(question.options || []).map((opt, optIdx) => (
            <div key={opt.id} className="flex items-center gap-2.5">
              <span className="w-4 text-xs font-medium text-muted-foreground text-right">{optIdx + 1}.</span>
              <input
                type="text"
                value={opt.label}
                onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                placeholder={`Option ${optIdx + 1}`}
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => handleDeleteOption(opt.id)}
                className="p-1 text-muted-foreground hover:text-red-500 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Option
          </button>
        </div>
      )}
    </div>
  );
};
