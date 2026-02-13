'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { SAFETY_CATEGORIES, SafetyObservation } from '@/lib/safety-categories';

interface Inspection {
  id: string;
  siteId: string;
  bigtimeProjectId: string;
  reportType: 'StandardPDF' | 'DraftWord';
  status: 'Draft' | 'Final';
  submittedAt: string | null;
  site?: { id: string; name: string };
}

interface Finding {
  id: string;
  inspectionId: string;
  category: string;
  observation: string | null;
  comment: string | null;
  status: 'Issue' | 'Positive';
  severity: 'Low' | 'Medium' | 'High';
  riskType: 'OSHA' | 'Behavioral' | 'Equipment' | 'Process';
  oshaRef: string | null;
  correctedOnSite: boolean;
}

interface SubmitResult {
  message?: string;
  [key: string]: unknown;
}

/* ---------- helpers ---------- */

function severityColor(severity: string): string {
  switch (severity) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/* ========== Main page component ========== */

export default function InspectionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [insp, finds] = await Promise.all([
          api.get<Inspection>(`/inspections/${id}`),
          api.get<Finding[]>(`/findings/by-inspection/${id}`),
        ]);
        setInspection(insp);
        setFindings(finds);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load inspection';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-sm">Loading inspection...</div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error ?? 'Inspection not found'}
      </div>
    );
  }

  /* Group findings by category for display */
  const findingsByCategory: Record<string, Finding[]> = {};
  findings.forEach((f) => {
    if (!findingsByCategory[f.category]) findingsByCategory[f.category] = [];
    findingsByCategory[f.category].push(f);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/inspections"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back to Inspections
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Inspection</h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              inspection.status === 'Final'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {inspection.status}
          </span>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-gray-500 font-medium">Site</dt>
            <dd className="mt-0.5 text-gray-900">{inspection.site?.name ?? inspection.siteId}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Report Type</dt>
            <dd className="mt-0.5 text-gray-900">
              {inspection.reportType === 'StandardPDF' ? 'Standard PDF' : 'Draft Word'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Status</dt>
            <dd className="mt-0.5 text-gray-900">{inspection.status}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Submitted</dt>
            <dd className="mt-0.5 text-gray-900">
              {inspection.submittedAt
                ? new Date(inspection.submittedAt).toLocaleString()
                : 'Not yet submitted'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Findings summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Findings ({findings.length})
        </h2>

        {findings.length === 0 ? (
          <p className="text-sm text-gray-500">No findings recorded yet. Select a category below to begin.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(findingsByCategory).map(([cat, catFindings]) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{cat}</h3>
                <div className="space-y-2">
                  {catFindings.map((finding) => (
                    <div
                      key={finding.id}
                      className={`border rounded-md p-3 flex flex-wrap items-start gap-3 ${
                        finding.status === 'Issue'
                          ? 'border-red-200 bg-red-50'
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-sm text-gray-900">
                          {finding.observation ?? finding.category}
                        </p>
                        {finding.comment && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            &ldquo;{finding.comment}&rdquo;
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {finding.riskType}
                          {finding.oshaRef ? ` | OSHA ${finding.oshaRef}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            finding.status === 'Issue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {finding.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColor(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                        {finding.correctedOnSite && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Corrected on site
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Findings by Category */}
      {inspection.status === 'Draft' && (
        <AddFindingsSection
          inspectionId={id}
          existingFindings={findings}
          onFindingsAdded={(newFindings) => setFindings((prev) => [...prev, ...newFindings])}
        />
      )}

      {/* Submit Inspection section */}
      <SubmitInspectionSection inspectionId={id} onSubmitted={(insp) => setInspection(insp)} />
    </div>
  );
}

/* ========== Observation row state ========== */

interface ObservationState {
  status: 'Issue' | 'Positive' | null;
  comment: string;
  correctedOnSite: boolean;
}

/* ========== Add Findings Section ========== */

function AddFindingsSection({
  inspectionId,
  existingFindings,
  onFindingsAdded,
}: {
  inspectionId: string;
  existingFindings: Finding[];
  onFindingsAdded: (findings: Finding[]) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [observations, setObservations] = useState<Map<number, ObservationState>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const category = SAFETY_CATEGORIES.find((c) => c.name === selectedCategory);

  /* Track which observations already have findings */
  const existingObservationTexts = new Set(
    existingFindings
      .filter((f) => f.category === selectedCategory)
      .map((f) => f.observation)
  );

  function handleCategoryChange(name: string) {
    setSelectedCategory(name);
    setObservations(new Map());
    setError(null);
    setSuccessMsg(null);
  }

  function setObsState(idx: number, update: Partial<ObservationState>) {
    setObservations((prev) => {
      const next = new Map(prev);
      const current = next.get(idx) ?? { status: null, comment: '', correctedOnSite: false };
      next.set(idx, { ...current, ...update });
      return next;
    });
  }

  function toggleStatus(idx: number, status: 'Issue' | 'Positive') {
    const current = observations.get(idx);
    if (current?.status === status) {
      // Deselect
      setObsState(idx, { status: null });
    } else {
      setObsState(idx, { status });
    }
  }

  async function handleSaveFindings() {
    setError(null);
    setSuccessMsg(null);

    if (!category) return;

    const toCreate: { obs: SafetyObservation; state: ObservationState }[] = [];
    observations.forEach((state, idx) => {
      if (state.status && category.observations[idx]) {
        toCreate.push({ obs: category.observations[idx], state });
      }
    });

    if (toCreate.length === 0) {
      setError('Mark at least one observation as Positive or Issue before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const created: Finding[] = [];
      for (const { obs, state } of toCreate) {
        const finding = await api.post<Finding>('/findings', {
          inspectionId,
          category: selectedCategory,
          observation: obs.text,
          comment: state.comment.trim() || undefined,
          status: state.status,
          severity: obs.defaultSeverity,
          riskType: obs.riskType,
          oshaRef: obs.oshaRef || undefined,
          correctedOnSite: state.correctedOnSite,
        });
        created.push(finding);
      }
      onFindingsAdded(created);
      setSuccessMsg(`${created.length} finding${created.length > 1 ? 's' : ''} saved for ${selectedCategory}.`);
      setObservations(new Map());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save findings';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const markedCount = Array.from(observations.values()).filter((s) => s.status !== null).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Findings</h2>

      {/* Category dropdown */}
      <div className="mb-6">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
          Safety Category
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category...</option>
          {SAFETY_CATEGORIES.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Observation checklist */}
      {category && (
        <>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-700 text-sm mb-4">
              {successMsg}
            </div>
          )}

          <div className="space-y-3">
            {category.observations.map((obs, idx) => {
              const alreadyRecorded = existingObservationTexts.has(obs.text);
              const state = observations.get(idx);
              const isIssue = state?.status === 'Issue';
              const isPositive = state?.status === 'Positive';

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 transition-colors ${
                    alreadyRecorded
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : isIssue
                      ? 'border-red-300 bg-red-50'
                      : isPositive
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{obs.text}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{obs.riskType}</span>
                        {obs.oshaRef && (
                          <span className="text-xs text-gray-500">OSHA {obs.oshaRef}</span>
                        )}
                        <span className={`text-xs ${severityColor(obs.defaultSeverity)} px-1.5 py-0.5 rounded`}>
                          {obs.defaultSeverity}
                        </span>
                      </div>
                    </div>

                    {alreadyRecorded ? (
                      <span className="text-xs text-gray-500 italic whitespace-nowrap">Already recorded</span>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleStatus(idx, 'Positive')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                            isPositive
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                          }`}
                        >
                          Positive
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(idx, 'Issue')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                            isIssue
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                          }`}
                        >
                          Issue
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded options when marked */}
                  {(isIssue || isPositive) && (
                    <div className="mt-3 pl-0 space-y-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Add a comment (optional)"
                          value={state?.comment ?? ''}
                          onChange={(e) => setObsState(idx, { comment: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {isIssue && (
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={state?.correctedOnSite ?? false}
                            onChange={(e) => setObsState(idx, { correctedOnSite: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Corrected on site
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveFindings}
              disabled={submitting || markedCount === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? 'Saving...'
                : `Save ${markedCount} Finding${markedCount !== 1 ? 's' : ''}`}
            </button>
            <span className="text-xs text-gray-500">
              {markedCount} of {category.observations.length} observations marked
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* ========== Submit Inspection Section ========== */

function SubmitInspectionSection({
  inspectionId,
  onSubmitted,
}: {
  inspectionId: string;
  onSubmitted: (inspection: Inspection) => void;
}) {
  const [submitType, setSubmitType] = useState<'Draft' | 'Final'>('Draft');
  const [timeEntry, setTimeEntry] = useState('');
  const [contactEmails, setContactEmails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultMessage(null);
    setSubmitting(true);

    try {
      const body: {
        submitType: 'Draft' | 'Final';
        timeEntry?: number;
        contactEmails?: string[];
      } = { submitType };

      if (submitType === 'Final') {
        if (timeEntry.trim()) {
          const parsed = Number(timeEntry.trim());
          if (!isNaN(parsed)) {
            body.timeEntry = parsed;
          }
        }
        if (contactEmails.trim()) {
          body.contactEmails = contactEmails
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        }
      }

      const result = await api.post<SubmitResult & Inspection>(
        `/inspections/${inspectionId}/submit`,
        body
      );

      setResultMessage(
        result.message ?? `Inspection submitted as ${submitType} successfully.`
      );

      if (result.id) {
        onSubmitted(result);
      } else {
        const updated = await api.get<Inspection>(`/inspections/${inspectionId}`);
        onSubmitted(updated);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit inspection';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Inspection</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {resultMessage && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            {resultMessage}
          </div>
        )}

        <div>
          <label htmlFor="submit-type" className="block text-sm font-medium text-gray-700 mb-1">
            Submit Type
          </label>
          <select
            id="submit-type"
            value={submitType}
            onChange={(e) => {
              setSubmitType(e.target.value as 'Draft' | 'Final');
              setResultMessage(null);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Draft">Draft</option>
            <option value="Final">Final</option>
          </select>
        </div>

        {submitType === 'Final' && (
          <>
            <div>
              <label htmlFor="time-entry" className="block text-sm font-medium text-gray-700 mb-1">
                Time Entry <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="time-entry"
                type="number"
                value={timeEntry}
                onChange={(e) => setTimeEntry(e.target.value)}
                placeholder="e.g. 4"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contact-emails" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Emails <span className="text-gray-400 font-normal">(optional, comma-separated)</span>
              </label>
              <input
                id="contact-emails"
                type="text"
                value={contactEmails}
                onChange={(e) => setContactEmails(e.target.value)}
                placeholder="e.g. roger@acme.com, jane@acme.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </form>
    </div>
  );
}
