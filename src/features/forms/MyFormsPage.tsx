import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formsApi, type FormAssignment } from '@/services/forms';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const MyFormsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<FormAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    formsApi.getMyAssignments().then((data) => {
      setAssignments(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Assigned Forms</h1>
        <p className="text-sm text-muted-foreground">View, fill, and submit assigned surveys and HR requests.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading assigned forms...</div>
      ) : assignments.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl text-center bg-card">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">You're all caught up!</h3>
          <p className="text-sm text-muted-foreground mt-1">There are no pending forms assigned to you at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((asgn) => {
            const isSubmitted = asgn.status === 'SUBMITTED';
            return (
              <div
                key={asgn.id}
                className="p-5 rounded-2xl border border-border bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        isSubmitted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {asgn.status}
                    </span>
                    {asgn.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-500" /> Due: {new Date(asgn.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground text-lg">{asgn.form?.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asgn.form?.description || 'No description provided.'}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Assigned: {new Date(asgn.assignedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => navigate(`/dashboard/my-forms/${asgn.formId}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {isSubmitted ? 'View Submission' : 'Fill Form'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
