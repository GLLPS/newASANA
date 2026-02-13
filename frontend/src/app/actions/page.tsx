'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

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

export default function ActionsPage() {
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
      setLoading(true);
      const data = await api.get<Action[]>('/actions');
      setActions(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load actions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

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
        <div className="text-gray-500 text-sm">Loading actions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Actions</h1>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-gray-900">No actions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Actions will appear here when created from inspections.
          </p>
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
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
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
                    {action.clientId.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {action.siteId.slice(0, 8)}...
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
