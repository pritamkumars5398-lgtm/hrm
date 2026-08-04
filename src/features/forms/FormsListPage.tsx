import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formsApi, type Form } from '@/services/forms';
import { AssignFormModal } from './AssignFormModal';
import { Plus, FileText, Eye, Users, Clock } from 'lucide-react';

export const FormsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningForm, setAssigningForm] = useState<Form | null>(null);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const data = await formsApi.getForms();
      setForms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Form Builder & Management</h1>
          <p className="text-sm text-muted-foreground">Create dynamic Google Forms-like surveys, workflows, and appraisals.</p>
        </div>

        <button
          onClick={() => navigate('/dashboard/forms/builder')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Form
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading forms...</div>
      ) : forms.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl text-center bg-card">
          <FileText className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No forms created yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Get started by creating your first dynamic HR form.</p>
          <button
            onClick={() => navigate('/dashboard/forms/builder')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg"
          >
            Create First Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => (
            <div
              key={form.id}
              className="p-5 rounded-2xl border border-border bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      form.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {form.status}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground text-base line-clamp-1">{form.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description || 'No description provided.'}</p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div>
                    <strong className="text-foreground font-semibold">{form.questions?.length || 0}</strong> Questions
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">{form._count?.responses || 0}</strong> Responses
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">{form._count?.assignments || 0}</strong> Assigned
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/dashboard/forms/builder/${form.id}`)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Edit
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/forms/${form.id}/responses`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Responses
                  </button>

                  {form.status === 'PUBLISHED' && (
                    <button
                      onClick={() => setAssigningForm(form)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" /> Assign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigningForm && (
        <AssignFormModal
          formId={assigningForm.id}
          formTitle={assigningForm.title}
          isOpen={!!assigningForm}
          onClose={() => setAssigningForm(null)}
          onAssigned={fetchForms}
        />
      )}
    </div>
  );
};
