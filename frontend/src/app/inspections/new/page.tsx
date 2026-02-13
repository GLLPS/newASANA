'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface CreatedInspection {
  id: string;
}

interface Client {
  id: string;
  name: string;
}

interface BigtimeProject {
  id: string;
  bigtimeProjectId: string;
  clientId: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
}

export default function NewInspectionPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<BigtimeProject[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [bigtimeProjectId, setBigtimeProjectId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [reportType, setReportType] = useState<'StandardPDF' | 'DraftWord'>('StandardPDF');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await api.get<Client[]>('/clients');
        setClients(data);
      } catch {
        // allow manual entry as fallback
      } finally {
        setLoadingDropdowns(false);
      }
    }
    fetchClients();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      setProjects([]);
      setSites([]);
      setBigtimeProjectId('');
      setSiteId('');
      return;
    }

    async function fetchForClient() {
      try {
        const [projectData, siteData] = await Promise.all([
          api.get<BigtimeProject[]>(`/bigtime-projects/by-client/${selectedClientId}`),
          api.get<Site[]>(`/sites/by-client/${selectedClientId}`),
        ]);
        setProjects(projectData);
        setSites(siteData);
      } catch {
        setProjects([]);
        setSites([]);
      }
    }
    fetchForClient();
  }, [selectedClientId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!bigtimeProjectId.trim() || !siteId.trim()) {
      setError('Please select a client, project, and site.');
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

        {loadingDropdowns ? (
          <div className="text-sm text-gray-500 py-4">Loading form data...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              {clients.length > 0 ? (
                <select
                  id="clientId"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-500">
                  No clients found.{' '}
                  <Link href="/bigtime" className="text-blue-600 hover:underline">Sync from BigTime</Link> first.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="bigtimeProjectId" className="block text-sm font-medium text-gray-700 mb-1">
                BigTime Project
              </label>
              {selectedClientId && projects.length > 0 ? (
                <select
                  id="bigtimeProjectId"
                  value={bigtimeProjectId}
                  onChange={(e) => setBigtimeProjectId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Project {p.bigtimeProjectId}
                    </option>
                  ))}
                </select>
              ) : selectedClientId ? (
                <div>
                  <input
                    id="bigtimeProjectId"
                    type="text"
                    value={bigtimeProjectId}
                    onChange={(e) => setBigtimeProjectId(e.target.value)}
                    placeholder="No projects synced - enter ID manually"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <Link href="/bigtime" className="text-blue-600 hover:underline">Sync projects from BigTime</Link> to use dropdown
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Select a client first</p>
              )}
            </div>

            <div>
              <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              {selectedClientId && sites.length > 0 ? (
                <select
                  id="siteId"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a site...</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : selectedClientId ? (
                <input
                  id="siteId"
                  type="text"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  placeholder="No sites for this client - enter ID manually"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              ) : (
                <p className="text-sm text-gray-400">Select a client first</p>
              )}
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
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || loadingDropdowns}
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
