import React, { useState } from 'react';
import type { FormQuestion, ResponseAnswer } from '@/services/forms';
import { Upload, CheckCircle2 } from 'lucide-react';

interface DynamicFormRendererProps {
  questions: FormQuestion[];
  initialValues?: Record<string, any>;
  onSubmit?: (answers: ResponseAnswer[]) => Promise<void>;
  readOnly?: boolean;
  isSubmitting?: boolean;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  questions,
  initialValues = {},
  onSubmit,
  readOnly = false,
  isSubmitting = false,
}) => {
  const [formState, setFormState] = useState<Record<string, any>>(initialValues);
  const [fileUrlsState, setFileUrlsState] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleInputChange = (questionId: string, value: any) => {
    setFormState((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      });
    }
  };

  const handleCheckboxChange = (questionId: string, optionValue: string, checked: boolean) => {
    const current = (formState[questionId] as string[]) || [];
    let updated: string[];
    if (checked) {
      updated = [...current, optionValue];
    } else {
      updated = current.filter((v) => v !== optionValue);
    }
    handleInputChange(questionId, updated);
  };

  const handleMockFileUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      uploadedUrls.push(URL.createObjectURL(files[i]));
    }
    setFileUrlsState((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...uploadedUrls],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
      if (q.required) {
        const val = formState[q.id];
        const files = fileUrlsState[q.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0 && (!files || files.length === 0))
        ) {
          newErrors[q.id] = `${q.label} is required.`;
        }
      }
      if (q.fieldType === 'EMAIL' && formState[q.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formState[q.id])) {
          newErrors[q.id] = 'Please enter a valid email address.';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSubmit) return;

    if (!validate()) return;

    const answers: ResponseAnswer[] = questions.map((q) => {
      const rawVal = formState[q.id];
      const files = fileUrlsState[q.id] || [];
      return {
        questionId: q.id,
        fieldType: q.fieldType,
        value: Array.isArray(rawVal) ? JSON.stringify(rawVal) : rawVal !== undefined ? String(rawVal) : '',
        fileUrls: files,
      };
    });

    await onSubmit(answers);
    setSubmittedSuccess(true);
  };

  if (submittedSuccess) {
    return (
      <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-200">Form Submitted Successfully!</h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Your response has been recorded and submitted for review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q) => {
        const hasError = !!errors[q.id];
        return (
          <div
            key={q.id}
            className={`p-5 rounded-xl border bg-card transition-all ${
              hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-border hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <label className="block text-sm font-semibold text-foreground mb-1">
              {q.label} {q.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {q.description && <p className="text-xs text-muted-foreground mb-3">{q.description}</p>}

            {/* Render input by type */}
            {q.fieldType === 'TEXT' && (
              <input
                type="text"
                disabled={readOnly}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="Your answer"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            {q.fieldType === 'LONG_TEXT' && (
              <textarea
                disabled={readOnly}
                rows={3}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="Your answer"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            {q.fieldType === 'EMAIL' && (
              <input
                type="email"
                disabled={readOnly}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            {q.fieldType === 'PHONE' && (
              <input
                type="tel"
                disabled={readOnly}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            {q.fieldType === 'NUMBER' && (
              <input
                type="number"
                disabled={readOnly}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            {(q.fieldType === 'DATE' || q.fieldType === 'TIME' || q.fieldType === 'DATETIME') && (
              <input
                type={q.fieldType === 'DATE' ? 'date' : q.fieldType === 'TIME' ? 'time' : 'datetime-local'}
                disabled={readOnly}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            {q.fieldType === 'DROPDOWN' && (
              <select
                disabled={readOnly}
                value={formState[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select an option</option>
                {q.options?.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {q.fieldType === 'RADIO' && (
              <div className="space-y-2 pt-1">
                {q.options?.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      disabled={readOnly}
                      value={opt.value}
                      checked={formState[q.id] === opt.value}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary/20"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {q.fieldType === 'CHECKBOX' && (
              <div className="space-y-2 pt-1">
                {q.options?.map((opt) => {
                  const currentVals = (formState[q.id] as string[]) || [];
                  const isChecked = currentVals.includes(opt.value);
                  return (
                    <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(q.id, opt.value, e.target.checked)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary/20"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {(q.fieldType === 'FILE' || q.fieldType === 'IMAGE') && (
              <div className="space-y-2">
                {!readOnly && (
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-input rounded-lg hover:bg-accent/50 cursor-pointer w-fit text-sm text-muted-foreground transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload {q.fieldType === 'IMAGE' ? 'Image' : 'File'}</span>
                    <input
                      type="file"
                      accept={q.fieldType === 'IMAGE' ? 'image/*' : '*'}
                      onChange={(e) => handleMockFileUpload(q.id, e)}
                      className="hidden"
                    />
                  </label>
                )}
                {fileUrlsState[q.id]?.length > 0 && (
                  <ul className="text-xs space-y-1 text-primary">
                    {fileUrlsState[q.id].map((_, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Upload className="w-3 h-3" /> File {idx + 1} uploaded
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {q.fieldType === 'SIGNATURE' && (
              <div className="border border-dashed rounded-lg p-4 bg-muted/20 text-center">
                <input
                  type="text"
                  disabled={readOnly}
                  value={formState[q.id] || ''}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  placeholder="Type full legal name as digital signature"
                  className="w-full px-3 py-2 text-sm italic font-serif border rounded bg-background text-center"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">Digital Signature Sign-off</span>
              </div>
            )}

            {hasError && <p className="text-xs text-red-500 mt-1.5">{errors[q.id]}</p>}
          </div>
        );
      })}

      {!readOnly && onSubmit && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      )}
    </form>
  );
};
