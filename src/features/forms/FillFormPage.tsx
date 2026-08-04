import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsApi, type Form, type ResponseAnswer } from '@/services/forms';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { ArrowLeft } from 'lucide-react';

export const FillFormPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formId) {
      formsApi
        .getFormById(formId)
        .then((data) => setForm(data))
        .finally(() => setIsLoading(false));
    }
  }, [formId]);

  const handleSubmit = async (answers: ResponseAnswer[]) => {
    if (!formId) return;
    setIsSubmitting(true);
    try {
      await formsApi.submitResponse(formId, answers);
    } catch (err) {
      console.error('Submit failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground">Loading form...</div>;
  }

  if (!form) {
    return <div className="p-12 text-center text-red-500">Form not found or unavailable.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/my-forms')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-base text-foreground">{form.title}</h1>
            <p className="text-xs text-muted-foreground">Dynamic Form Submission</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto mt-8 px-4">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-foreground">{form.title}</h2>
            {form.description && <p className="text-sm text-muted-foreground mt-1">{form.description}</p>}
          </div>

          <DynamicFormRenderer
            questions={form.questions}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
};
