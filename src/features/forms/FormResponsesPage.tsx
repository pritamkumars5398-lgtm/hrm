import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsApi, type FormResponse, type Form } from '@/services/forms';
import { ArrowLeft, User, FileSpreadsheet } from 'lucide-react';

export const FormResponsesPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [comment, setComment] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const loadData = async () => {
    if (!formId) return;
    setIsLoading(true);
    try {
      const [formData, respData] = await Promise.all([
        formsApi.getFormById(formId),
        formsApi.getFormResponses(formId),
      ]);
      setForm(formData);
      setResponses(respData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [formId]);

  const handleDecide = async (action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (!selectedResponse) return;
    setIsDeciding(true);
    try {
      await formsApi.decideApproval(selectedResponse.id, action, comment);
      setSelectedResponse(null);
      setComment('');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeciding(false);
    }
  };

  const exportCSV = () => {
    if (!form || responses.length === 0) return;

    const headers = ['Response ID', 'Employee Name', 'Department', 'Submitted At', 'Status'];
    form.questions.forEach((q) => headers.push(`"${q.label.replace(/"/g, '""')}"`));

    const rows = responses.map((r) => {
      const empName = r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Unknown';
      const dept = r.employee?.department || 'N/A';
      const submitted = new Date(r.submittedAt).toLocaleString();

      const answerMap = new Map(r.answers.map((a) => [a.questionId, a.value || (a.fileUrls?.join(';') || '')]));

      const row = [r.id, `"${empName}"`, `"${dept}"`, `"${submitted}"`, r.status];
      form.questions.forEach((q) => {
        const val = answerMap.get(q.id) || '';
        row.push(`"${String(val).replace(/"/g, '""')}"`);
      });
      return row.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground">Loading responses...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/forms')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{form?.title} — Responses</h1>
            <p className="text-sm text-muted-foreground">Total Submissions: {responses.length}</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          disabled={responses.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium text-xs rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl text-center bg-card">
          <p className="text-sm text-muted-foreground">No submissions recorded for this form yet.</p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {responses.map((r) => (
                <tr key={r.id} className="hover:bg-accent/40 transition-colors">
                  <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Employee'}
                  </td>
                  <td className="p-4 text-muted-foreground">{r.employee?.department || 'N/A'}</td>
                  <td className="p-4 text-muted-foreground">{new Date(r.submittedAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedResponse(r)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      Review Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedResponse && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="font-semibold text-foreground text-base">Submission Review</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedResponse.employee ? `${selectedResponse.employee.firstName} ${selectedResponse.employee.lastName}` : 'Employee'}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {form.questions.map((q) => {
                const ans = selectedResponse.answers.find((a) => a.questionId === q.id);
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-background space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">{q.label}</p>
                    <p className="text-sm text-foreground font-medium">{ans?.value || ans?.fileUrls?.join(', ') || 'No Answer'}</p>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-border space-y-2">
                <label className="block text-xs font-semibold text-foreground">Reviewer Comment</label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional review notes or feedback"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
              <button
                onClick={() => handleDecide('REJECTED')}
                disabled={isDeciding}
                className="px-4 py-2 bg-red-600 text-white text-xs font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleDecide('CHANGES_REQUESTED')}
                disabled={isDeciding}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-medium rounded-xl hover:bg-amber-700 transition-colors"
              >
                Request Changes
              </button>
              <button
                onClick={() => handleDecide('APPROVED')}
                disabled={isDeciding}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
