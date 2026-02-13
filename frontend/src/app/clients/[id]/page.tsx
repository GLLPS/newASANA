'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Client {
  id: string;
  name: string;
  weeklySummaryEnabled: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  receiveInspectionsDefault: boolean;
}

interface Site {
  id: string;
  name: string;
}

interface Action {
  id: string;
  clientId: string;
  siteId: string;
  inspectionId: string;
  findingId: string;
  description: string;
  responsibleName: string;
  responsibleEmail?: string;
  dueDate: string;
  status: 'Open' | 'Closed';
  closedByUserId?: string | null;
  closedAt?: string | null;
  finding?: { id: string; category: string };
  inspection?: { id: string };
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Close modal state
  const [closeModalAction, setCloseModalAction] = useState<Action | null>(null);
  const [closeNote, setCloseNote] = useState('');
  const [closing, setClosing] = useState(false);

  // Reopen modal state
  const [reopenModalAction, setReopenModalAction] = useState<Action | null>(null);
  const [reopenDueDate, setReopenDueDate] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  const fetchActions = useCallback(async () => {
    try {
      const data = await api.get<Action[]>(`/actions/by-client/${clientId}`);
      setActions(data);
    } catch {
      // Actions fetch error is non-critical; section will show empty
    }
  }, [clientId]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [clientData, contactsData, sitesData, actionsData] = await Promise.all([
          api.get<Client>(`/clients/${clientId}`),
          api.get<Contact[]>(`/contacts/by-client/${clientId}`),
          api.get<Site[]>(`/sites/by-client/${clientId}`),
          api.get<Action[]>(`/actions/by-client/${clientId}`),
        ]);
        setClient(clientData);
        setContacts(contactsData);
        setSites(sitesData);
        setActions(actionsData);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load client details';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    if (clientId) fetchData();
  }, [clientId]);

  const handleClose = async () => {
    if (!closeModalAction) return;
    try {
      setClosing(true);
      await api.post(`/actions/${closeModalAction.id}/close`, { note: closeNote || undefined });
      setCloseModalAction(null);
      setCloseNote('');
      await fetchActions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to close action';
      alert(message);
    } finally {
      setClosing(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenModalAction || !reopenDueDate || !reopenReason) return;
    try {
      setReopening(true);
      await api.post(`/actions/${reopenModalAction.id}/reopen`, {
        newDueDate: reopenDueDate,
        reason: reopenReason,
      });
      setReopenModalAction(null);
      setReopenDueDate('');
      setReopenReason('');
      await fetchActions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reopen action';
      alert(message);
    } finally {
      setReopening(false);
    }
  };

  function getRowClassName(action: Action): string {
    if (action.status === 'Closed') return '';
    const now = new Date();
    const due = new Date(action.dueDate);
    if (due < now) return 'bg-red-50';
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    if (due <= sevenDaysFromNow) return 'bg-yellow-50';
    return '';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-sm">Loading client details...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error || 'Client not found'}
      </div>
    );
  }

  return (
    <div>
      {/* Client Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              client.weeklySummaryEnabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {client.weeklySummaryEnabled ? 'Weekly Summary On' : 'Weekly Summary Off'}
          </span>
        </div>
        <p className="text-sm text-gray-500">Client ID: {client.id}</p>
      </div>

      {/* Contacts Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Contacts</h2>
        {contacts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">No contacts found for this client.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receives Inspections
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contact.receiveInspectionsDefault
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {contact.receiveInspectionsDefault ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sites Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Sites</h2>
        {sites.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">No sites found for this client.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <h3 className="text-sm font-medium text-gray-900">{site.name}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open Actions Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
        {actions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">No actions found for this client.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsible
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actions.map((action) => (
                  <tr
                    key={action.id}
                    className={`hover:bg-gray-50 transition-colors ${getRowClassName(action)}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {action.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(action.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          action.status === 'Open'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {action.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {action.responsibleName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {action.status === 'Open' ? (
                        <button
                          onClick={() => setCloseModalAction(action)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          Close
                        </button>
                      ) : (
                        <button
                          onClick={() => setReopenModalAction(action)}
                          className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Close Action Modal */}
      {closeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Close Action</h2>
            <p className="text-sm text-gray-500 mb-4">
              Closing: {closeModalAction.description}
            </p>
            <div className="mb-4">
              <label htmlFor="close-note" className="block text-sm font-medium text-gray-700 mb-1">
                Note (optional)
              </label>
              <textarea
                id="close-note"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Add a note about why this action is being closed..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCloseModalAction(null);
                  setCloseNote('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={closing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {closing ? 'Closing...' : 'Confirm Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Action Modal */}
      {reopenModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Reopen Action</h2>
            <p className="text-sm text-gray-500 mb-4">
              Reopening: {reopenModalAction.description}
            </p>
            <div className="mb-4">
              <label htmlFor="reopen-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                New Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="reopen-due-date"
                type="date"
                value={reopenDueDate}
                onChange={(e) => setReopenDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="reopen-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reopen-reason"
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Provide a reason for reopening this action..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReopenModalAction(null);
                  setReopenDueDate('');
                  setReopenReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                disabled={reopening || !reopenDueDate || !reopenReason}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {reopening ? 'Reopening...' : 'Confirm Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
