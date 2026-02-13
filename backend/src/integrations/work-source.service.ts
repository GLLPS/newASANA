export interface WorkSourceItem {
  externalId: string;
  externalSource: string;
  type: 'Inspection' | 'Training';
  clientName: string;
  siteName: string;
  assigneeName: string;
  scheduledDate: string;
}

export interface IWorkSourceService {
  fetchUpcomingWork(tenantId: string): Promise<WorkSourceItem[]>;
}

export class StubWorkSourceService implements IWorkSourceService {
  async fetchUpcomingWork(_tenantId: string): Promise<WorkSourceItem[]> {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);

    return [
      {
        externalId: 'ASANA-001',
        externalSource: 'Asana',
        type: 'Inspection',
        clientName: 'Acme Construction',
        siteName: 'Downtown Tower Project',
        assigneeName: 'John Inspector',
        scheduledDate: new Date(monday.getTime()).toISOString(),
      },
      {
        externalId: 'ASANA-002',
        externalSource: 'Asana',
        type: 'Training',
        clientName: 'Acme Construction',
        siteName: 'Highway Bridge Site',
        assigneeName: 'John Inspector',
        scheduledDate: new Date(monday.getTime() + 86400000).toISOString(),
      },
      {
        externalId: 'ASANA-003',
        externalSource: 'Asana',
        type: 'Inspection',
        clientName: 'SafeBuild Inc',
        siteName: 'Warehouse Renovation',
        assigneeName: 'Jane Safety',
        scheduledDate: new Date(monday.getTime() + 2 * 86400000).toISOString(),
      },
    ];
  }
}
