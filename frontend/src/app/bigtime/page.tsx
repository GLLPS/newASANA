'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BigTimeStaff {
  StaffSID: number;
  FullName: string;
  EMail: string;
  Title: string;
  Phone_Cell: string;
  IsInactive: boolean;
  UserAccountStatus: string;
}

interface BigTimeProject {
  SystemId: number;
  Nm: string;
  DisplayName: string;
  ProjectCode: string;
  IsInactive: boolean;
  StartDt: string;
}

interface BigTimeClient {
  SystemId: number;
  Nm: string;
  ClientID: string;
  City: string;
  State: string;
  MainPH: string;
}

interface SyncResult {
  clients: { total: number; created: number; alreadyExisted: number };
  projects: { totalActive: number; created: number; skipped: number };
  staff: { totalActive: number; created: number; alreadyExisted: number };
}

type TabId = 'overview' | 'staff' | 'projects' | 'clients';

export default function BigTimePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [staff, setStaff] = useState<BigTimeStaff[]>([]);
  const [projects, setProjects] = useState<BigTimeProject[]>([]);
  const [clients, setClients] = useState<BigTimeClient[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);

  const [seedingDemo, setSeedingDemo] = useState(false);
  const [seedResult, setSeedResult] = useState<{ message: string; items?: string[] } | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<{
    connected?: boolean;
    clientCount?: number;
    error?: string;
  } | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    api.get<{ connected: boolean; clientCount?: number; error?: string }>('/bigtime/status')
      .then(setConnectionStatus)
      .catch(() => setConnectionStatus({ connected: false, error: 'Could not reach backend' }))
      .finally(() => setCheckingConnection(false));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const result = await api.post<SyncResult>('/bigtime/sync');
      setSyncResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setSyncError(message);
    } finally {
      setSyncing(false);
    }
  }

  async function loadTab(tab: TabId) {
    setActiveTab(tab);
    if (tab === 'overview') return;

    setLoadingData(true);
    setTabError(null);
    try {
      if (tab === 'staff') {
        const data = await api.get<BigTimeStaff[]>('/bigtime/staff');
        setStaff(Array.isArray(data) ? data.filter(s => !s.IsInactive) : []);
      } else if (tab === 'projects') {
        const data = await api.get<BigTimeProject[]>('/bigtime/projects');
        setProjects(Array.isArray(data) ? data.filter(p => !p.IsInactive && p.Nm) : []);
      } else if (tab === 'clients') {
        const data = await api.get<BigTimeClient[]>('/bigtime/clients');
        setClients(Array.isArray(data) ? data.filter(c => c.Nm) : []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load data from BigTime';
      setTabError(message);
    } finally {
      setLoadingData(false);
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview & Sync' },
    { id: 'staff', label: 'Staff' },
    { id: 'projects', label: 'Projects' },
    { id: 'clients', label: 'Clients' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">BigTime Integration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connected to your live BigTime account. Sync data or browse your BigTime records.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => loadTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {tabError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm mb-6">
          {tabError}
        </div>
      )}

      {/* Overview / Sync Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sync BigTime Data</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pull clients, projects, and staff from your BigTime account into the local database.
              Existing records will be preserved; only new data will be added.
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </button>
          </div>

          {syncError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {syncError}
            </div>
          )}

          {syncResult && (
            <div className="bg-white rounded-lg border border-green-200 p-6">
              <h3 className="text-base font-semibold text-green-800 mb-4">Sync Complete</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{syncResult.clients.created}</p>
                  <p className="text-xs text-green-600 mt-1">New Clients</p>
                  <p className="text-xs text-gray-500">{syncResult.clients.total} total in BigTime</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{syncResult.projects.created}</p>
                  <p className="text-xs text-blue-600 mt-1">New Projects</p>
                  <p className="text-xs text-gray-500">{syncResult.projects.totalActive} active in BigTime</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700">{syncResult.staff.created}</p>
                  <p className="text-xs text-purple-600 mt-1">New Staff</p>
                  <p className="text-xs text-gray-500">{syncResult.staff.totalActive} active in BigTime</p>
                </div>
              </div>
            </div>
          )}

          {/* Seed Demo Week */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Seed Demo Schedule</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create demo inspection work items for this week using your synced BigTime projects.
              Items will appear on the &ldquo;This Week&rdquo; dashboard.
            </p>
            <button
              onClick={async () => {
                setSeedingDemo(true);
                setSeedResult(null);
                try {
                  const result = await api.post<{ message: string; items?: string[] }>('/work-items/seed-demo-week');
                  setSeedResult(result);
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Failed to seed demo data';
                  setSeedResult({ message });
                } finally {
                  setSeedingDemo(false);
                }
              }}
              disabled={seedingDemo}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {seedingDemo ? 'Seeding...' : 'Seed This Week'}
            </button>
            {seedResult && (
              <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-sm">
                <p className="font-medium">{seedResult.message}</p>
                {seedResult.items && seedResult.items.length > 0 && (
                  <ul className="mt-1 text-xs space-y-0.5">
                    {seedResult.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Connection Details</h3>
            <div className="text-sm text-gray-500 space-y-1">
              <p>API: iq.bigtime.net</p>
              <p>Auth: Firm-Level API Token</p>
              {checkingConnection ? (
                <p>Status: <span className="text-gray-400 font-medium">Checking...</span></p>
              ) : connectionStatus?.connected ? (
                <p>Status: <span className="text-green-600 font-medium">Connected</span> ({connectionStatus.clientCount} clients found)</p>
              ) : (
                <div>
                  <p>Status: <span className="text-red-600 font-medium">Not Connected</span></p>
                  {connectionStatus?.error && (
                    <p className="text-red-500 text-xs mt-1">{connectionStatus.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div>
          {loadingData ? (
            <div className="text-center py-12 text-gray-500 text-sm">Loading staff from BigTime...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No active staff found.</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((s) => (
                    <tr key={s.StaffSID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.FullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.EMail}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.Title || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.Phone_Cell || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {s.UserAccountStatus === 'IsActive' ? 'Active' : s.UserAccountStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          {loadingData ? (
            <div className="text-center py-12 text-gray-500 text-sm">Loading projects from BigTime...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No active projects found.</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client : Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.slice(0, 50).map((p) => (
                    <tr key={p.SystemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.ProjectCode}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.Nm}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{p.DisplayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.StartDt || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {projects.length > 50 && (
                <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 text-center">
                  Showing 50 of {projects.length} projects
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div>
          {loadingData ? (
            <div className="text-center py-12 text-gray-500 text-sm">Loading clients from BigTime...</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No clients found.</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.slice(0, 50).map((c) => (
                    <tr key={c.SystemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.Nm}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{c.ClientID}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {c.City && c.State ? `${c.City}, ${c.State}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{c.MainPH || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length > 50 && (
                <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 text-center">
                  Showing 50 of {clients.length} clients
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
