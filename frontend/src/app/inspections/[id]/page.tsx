'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

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

/* ---------- severity badge helper ---------- */

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

  /* ---------- fetch data ---------- */

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

      {/* Findings section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Findings ({findings.length})
        </h2>

        {findings.length === 0 ? (
          <p className="text-sm text-gray-500">No findings recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {findings.map((finding) => (
              <div
                key={finding.id}
                className="border border-gray-200 rounded-md p-4 flex flex-wrap items-start gap-3"
              >
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium text-gray-900">{finding.category}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {finding.riskType}
                    {finding.oshaRef ? ` -- OSHA Ref: ${finding.oshaRef}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      finding.status === 'Issue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {finding.status}
                  </span>
                  {/* Severity badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColor(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>
                  {/* Corrected on site */}
                  {finding.correctedOnSite && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Corrected on site
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Finding form */}
        <AddFindingForm
          inspectionId={id}
          onFindingAdded={(finding) => setFindings((prev) => [...prev, finding])}
        />
      </div>

      {/* Submit Inspection section */}
      <SubmitInspectionSection inspectionId={id} onSubmitted={(insp) => setInspection(insp)} />
    </div>
  );
}

/* ========== Add Finding Form ========== */

function AddFindingForm({
  inspectionId,
  onFindingAdded,
}: {
  inspectionId: string;
  onFindingAdded: (finding: Finding) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'Issue' | 'Positive'>('Issue');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [riskType, setRiskType] = useState<'OSHA' | 'Behavioral' | 'Equipment' | 'Process'>('OSHA');
  const [oshaRef, setOshaRef] = useState('');
  const [correctedOnSite, setCorrectedOnSite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setCategory('');
    setStatus('Issue');
    setSeverity('Low');
    setRiskType('OSHA');
    setOshaRef('');
    setCorrectedOnSite(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!category.trim()) {
      setError('Category is required.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.post<Finding>('/findings', {
        inspectionId,
        category: category.trim(),
        status,
        severity,
        riskType,
        oshaRef: oshaRef.trim() || undefined,
        correctedOnSite,
      });
      onFindingAdded(created);
      resetForm();
      setExpanded(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add finding';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        {expanded ? '- Hide Add Finding' : '+ Add Finding'}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="finding-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              id="finding-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Fall Protection"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="finding-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="finding-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Issue' | 'Positive')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Issue">Issue</option>
                <option value="Positive">Positive</option>
              </select>
            </div>

            <div>
              <label htmlFor="finding-severity" className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                id="finding-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="finding-riskType" className="block text-sm font-medium text-gray-700 mb-1">
              Risk Type
            </label>
            <select
              id="finding-riskType"
              value={riskType}
              onChange={(e) =>
                setRiskType(e.target.value as 'OSHA' | 'Behavioral' | 'Equipment' | 'Process')
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="OSHA">OSHA</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Equipment">Equipment</option>
              <option value="Process">Process</option>
            </select>
          </div>

          <div>
            <label htmlFor="finding-oshaRef" className="block text-sm font-medium text-gray-700 mb-1">
              OSHA Reference <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="finding-oshaRef"
              type="text"
              value={oshaRef}
              onChange={(e) => setOshaRef(e.target.value)}
              placeholder="e.g. 1926.501(b)(1)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="finding-correctedOnSite"
              type="checkbox"
              checked={correctedOnSite}
              onChange={(e) => setCorrectedOnSite(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="finding-correctedOnSite" className="text-sm text-gray-700">
              Corrected on site
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Finding'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setExpanded(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
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

  async function handleSubmit(e: FormEvent) {
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

      // Update the parent with refreshed inspection data
      if (result.id) {
        onSubmitted(result);
      } else {
        // Re-fetch the inspection to get updated status
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
