import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsApi, type Form, type FormQuestion } from '@/services/forms';
import { QuestionCard } from './QuestionCard';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { Plus, Eye, Send, ArrowLeft, Save } from 'lucide-react';

export const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      id: `fq-${Date.now()}-1`,
      label: 'Full Name',
      fieldType: 'TEXT',
      required: true,
      order: 0,
    },
    {
      id: `fq-${Date.now()}-2`,
      label: 'Department',
      fieldType: 'DROPDOWN',
      required: true,
      order: 1,
      options: [
        { id: 'opt-1', label: 'Engineering', value: 'engineering', order: 0 },
        { id: 'opt-2', label: 'HR', value: 'hr', order: 1 },
        { id: 'opt-3', label: 'Marketing', value: 'marketing', order: 2 },
      ],
    },
  ]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'>('DRAFT');

  useEffect(() => {
    if (id) {
      formsApi.getFormById(id).then((form) => {
        setTitle(form.title);
        setDescription(form.description || '');
        setStatus(form.status);
        if (form.questions && form.questions.length > 0) {
          setQuestions(form.questions);
        }
      });
    }
  }, [id]);

  const handleAddQuestion = () => {
    const newQ: FormQuestion = {
      id: `fq-${Date.now()}-${questions.length + 1}`,
      label: 'Untitled Question',
      fieldType: 'TEXT',
      required: false,
      order: questions.length,
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
  };

  const handleUpdateQuestion = (updated: FormQuestion) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };

  const handleDuplicateQuestion = (qId: string) => {
    const target = questions.find((q) => q.id === qId);
    if (!target) return;
    const duplicated: FormQuestion = {
      ...target,
      id: `fq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: `${target.label} (Copy)`,
      order: questions.length,
    };
    setQuestions((prev) => [...prev, duplicated]);
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      let savedForm: Form;
      const payload = {
        title,
        description,
        questions: questions.map((q, idx) => ({ ...q, order: idx })),
      };

      if (id) {
        savedForm = await formsApi.updateForm(id, payload);
      } else {
        savedForm = await formsApi.createForm(payload);
      }

      if (publish) {
        setIsPublishing(true);
        await formsApi.updateStatus(savedForm.id, 'PUBLISHED');
        setStatus('PUBLISHED');
      }

      navigate(`/dashboard/forms`);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/forms')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base text-foreground">{title || 'Untitled Form'}</h1>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  status === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Google Forms-like Dynamic Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-input hover:bg-accent transition-colors"
          >
            <Eye className="w-4 h-4" /> {isPreview ? 'Back to Editor' : 'Preview'}
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg border border-input bg-card hover:bg-accent transition-colors"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" /> {isPublishing ? 'Publishing...' : 'Publish Form'}
          </button>
        </div>
      </header>

      {/* Main Canvas / Content */}
      <main className="max-w-3xl mx-auto mt-8 px-4">
        {isPreview ? (
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <DynamicFormRenderer questions={questions} readOnly />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Form Title & Description Card */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm border-t-4 border-t-primary">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Form Title"
                className="w-full text-2xl font-bold border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent py-1 transition-colors"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Form Description (optional)"
                className="w-full text-sm text-muted-foreground border-b border-transparent hover:border-border focus:border-primary focus:outline-none bg-transparent py-1 mt-2 transition-colors"
              />
            </div>

            {/* Questions List */}
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                isSelected={selectedQuestionId === q.id}
                onSelect={() => setSelectedQuestionId(q.id)}
                onChange={handleUpdateQuestion}
                onDuplicate={() => handleDuplicateQuestion(q.id)}
                onDelete={() => handleDeleteQuestion(q.id)}
              />
            ))}

            {/* Add Question Button */}
            <button
              onClick={handleAddQuestion}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-primary rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-all bg-card/50 hover:bg-card"
            >
              <Plus className="w-5 h-5" /> Add Question
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
