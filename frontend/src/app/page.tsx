'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

// ── Types matching backend Prisma models ──────────────────────────────

interface WorkItem {
  id: string;
  type: 'Inspection' | 'Training';
  scheduledDate: string;
  client: { id: string; name: string } | null;
  bigtimeProject: { id: string; name: string | null; bigtimeProjectId: string } | null;
  site: { id: string; name: string } | null;
}

interface Action {
  id: string;
  description: string;
  dueDate: string;
  status: 'Open' | 'Closed';
  siteId: string;
  inspection: { id: string } | null;
  finding: { id: string; category: string } | null;
}

// ── Mock data (shown when API is unavailable) ─────────────────────────

function getMockWorkItems(): WorkItem[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return [
    {
      id: 'mock-wi-1',
      type: 'Inspection',
      scheduledDate: monday.toISOString(),
      client: { id: 'mock-c1', name: 'Acme Construction' },
      bigtimeProject: { id: 'mock-bt1', name: 'Acme Tower Build', bigtimeProjectId: '101' },
      site: { id: 'mock-s1', name: 'Downtown Tower Project' },
    },
    {
      id: 'mock-wi-2',
      type: 'Training',
      scheduledDate: wednesday.toISOString(),
      client: { id: 'mock-c2', name: 'Metro Builders Inc.' },
      bigtimeProject: { id: 'mock-bt2', name: 'Metro Warehouse', bigtimeProjectId: '102' },
      site: { id: 'mock-s2', name: 'Riverside Warehouse' },
    },
    {
      id: 'mock-wi-3',
      type: 'Inspection',
      scheduledDate: friday.toISOString(),
      client: { id: 'mock-c1', name: 'Acme Construction' },
      bigtimeProject: { id: 'mock-bt1', name: 'Acme Tower Build', bigtimeProjectId: '101' },
      site: { id: 'mock-s3', name: 'Highway 9 Bridge' },
    },
  ];
}

function getMockActions(): Action[] {
  const today = new Date();

  const overdue = new Date(today);
  overdue.setDate(today.getDate() - 3);

  const dueSoon = new Date(today);
  dueSoon.setDate(today.getDate() + 3);

  return [
    {
      id: 'mock-a1',
      description: 'Install fall protection guardrails on east scaffolding',
      dueDate: overdue.toISOString(),
      status: 'Open',
      siteId: 'mock-s1',
      inspection: { id: 'mock-i1' },
      finding: { id: 'mock-f1', category: 'Fall Protection' },
    },
    {
      id: 'mock-a2',
      description: 'Replace damaged hard hats and update PPE inventory log',
      dueDate: dueSoon.toISOString(),
      status: 'Open',
      siteId: 'mock-s2',
      inspection: { id: 'mock-i2' },
      finding: { id: 'mock-f2', category: 'PPE' },
    },
  ];
}

// ── Date helpers ──────────────────────────────────────────────────────

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getRelativeDueLabel(dateStr: string): { text: string; color: string } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
      color: 'red',
    };
  }
  if (diffDays === 0) {
    return { text: 'Due today', color: 'yellow' };
  }
  if (diffDays <= 3) {
    return { text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'yellow' };
  }
  return { text: `Due in ${diffDays} days`, color: 'gray' };
}

// ── Sub-components ────────────────────────────────────────────────────

function WorkItemCard({ item }: { item: WorkItem }) {
  const isInspection = item.type === 'Inspection';

  // Build link for starting an inspection from this work item
  const inspectionLink = isInspection && item.client
    ? `/inspections/new?clientId=${item.client.id}${
        item.bigtimeProject ? `&projectId=${item.bigtimeProject.id}` : ''
      }${item.site ? `&siteId=${item.site.id}` : ''}`
    : null;

  const content = (
    <>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${
          isInspection ? 'bg-blue-500' : 'bg-emerald-500'
        }`}
      >
        {isInspection ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isInspection
                ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {item.type}
          </span>
          <span className="text-xs text-gray-500">
            {formatShortDate(item.scheduledDate)}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.client?.name ?? 'Unknown Client'}
        </p>
        {item.bigtimeProject?.name && (
          <p className="text-xs text-gray-600 truncate">{item.bigtimeProject.name}</p>
        )}
        {item.site && (
          <p className="text-xs text-gray-500 truncate">{item.site.name}</p>
        )}
      </div>
      {inspectionLink && (
        <div className="flex-shrink-0 self-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
    </>
  );

  if (inspectionLink) {
    return (
      <Link href={inspectionLink} className="card flex items-start gap-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
        {content}
      </Link>
    );
  }

  return (
    <div className="card flex items-start gap-4">
      {content}
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  const dueLabel = getRelativeDueLabel(action.dueDate);

  const badgeClasses: Record<string, string> = {
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-gray-900 leading-snug">
          {action.description}
        </p>
        <span
          className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
            badgeClasses[dueLabel.color] || badgeClasses.gray
          }`}
        >
          {dueLabel.text}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>Due: {formatShortDate(action.dueDate)}</span>
        {action.finding && (
          <>
            <span className="text-gray-300">|</span>
            <span>{action.finding.category}</span>
          </>
        )}
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────

export default function ThisWeekPage() {
  const { user } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loadingWork, setLoadingWork] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchWorkItems() {
      try {
        const data = await api.get<WorkItem[]>('/work-items/my-week');
        if (!cancelled) {
          setWorkItems(data);
        }
      } catch {
        if (!cancelled) {
          setWorkItems(getMockWorkItems());
          setUsingMockData(true);
        }
      } finally {
        if (!cancelled) setLoadingWork(false);
      }
    }

    async function fetchActions() {
      try {
        const data = await api.get<Action[]>('/actions');
        if (!cancelled) {
          setActions(data.filter((a) => a.status === 'Open'));
        }
      } catch {
        if (!cancelled) {
          setActions(getMockActions());
          setUsingMockData(true);
        }
      } finally {
        if (!cancelled) setLoadingActions(false);
      }
    }

    fetchWorkItems();
    fetchActions();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">This Week</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your scheduled work and open action items
          </p>
        </div>
        <Link
          href="/inspections/new"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Inspection
        </Link>
      </div>

      {/* Mock data notice */}
      {usingMockData && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="font-medium">Demo mode:</span> Could not reach the
          API server. Showing sample data below.
        </div>
      )}

      {/* Scheduled Work This Week */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Scheduled Work This Week
        </h2>
        {loadingWork ? (
          <SectionSkeleton />
        ) : workItems.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-gray-500">
              No work items scheduled for this week.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workItems.map((item) => (
              <WorkItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* My Open Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Open Actions
        </h2>
        {loadingActions ? (
          <SectionSkeleton />
        ) : actions.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-gray-500">
              No open actions at this time. You are all caught up.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
