'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface CreatedInspection {
  id: string;
}

export default function NewInspectionPage() {
  const router = useRouter();
  const [bigtimeProjectId, setBigtimeProjectId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [reportType, setReportType] = useState<'StandardPDF' | 'DraftWord'>('StandardPDF');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!bigtimeProjectId.trim() || !siteId.trim()) {
      setError('BigTime Project ID and Site ID are required.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.post<CreatedInspection>('/inspections', {
        bigtimeProjectId: bigtimeProjectId.trim(),
        siteId: siteId.trim(),
        reportType,
      });
      router.push(`/inspections/${created.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create inspection';
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/inspections"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back to Inspections
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Inspection</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 max-w-lg">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="bigtimeProjectId" className="block text-sm font-medium text-gray-700 mb-1">
              BigTime Project ID
            </label>
            <input
              id="bigtimeProjectId"
              type="text"
              value={bigtimeProjectId}
              onChange={(e) => setBigtimeProjectId(e.target.value)}
              placeholder="Enter BigTime Project ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-1">
              Site ID
            </label>
            <input
              id="siteId"
              type="text"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Enter Site ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'StandardPDF' | 'DraftWord')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="StandardPDF">Standard PDF</option>
              <option value="DraftWord">Draft Word</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Inspection'}
          </button>
          <Link
            href="/inspections"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
