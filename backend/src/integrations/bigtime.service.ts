export interface TimeEntry {
  projectId: string;
  userId: string;
  hours: number;
  date: string;
  note: string;
}

export interface IBigTimeService {
  logTime(tenantId: string, entry: TimeEntry): Promise<{ success: boolean; entryId: string }>;
  getProjectHours(tenantId: string, projectId: string): Promise<number>;
}

export class StubBigTimeService implements IBigTimeService {
  async logTime(_tenantId: string, entry: TimeEntry): Promise<{ success: boolean; entryId: string }> {
    console.log(`[STUB BigTime] Logging ${entry.hours}h for project ${entry.projectId}`);
    return { success: true, entryId: `BT-${Date.now()}` };
  }

  async getProjectHours(_tenantId: string, _projectId: string): Promise<number> {
    return 24.5;
  }
}
