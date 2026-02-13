export interface TimeEntry {
  projectId: string;
  staffSid?: number;
  userId: string;
  hours: number;
  date: string;
  note: string;
}

export interface IBigTimeService {
  logTime(tenantId: string, entry: TimeEntry): Promise<{ success: boolean; entryId: string }>;
  getProjectHours(tenantId: string, projectId: string): Promise<number>;
  getStaff(): Promise<BigTimeStaffMember[]>;
  getProjects(): Promise<BigTimeProject[]>;
  getClients(): Promise<BigTimeClient[]>;
  getProjectDetail(projectSid: number): Promise<BigTimeProject | null>;
}

export interface BigTimeStaffMember {
  StaffSID: number;
  FName: string;
  SName: string;
  FullName: string;
  EMail: string;
  Title: string;
  Phone_Cell: string;
  Phone_Wk: string;
  IsInactive: boolean;
  ManagerID: number;
  Start_dt: string;
  UserAccountStatus: string;
}

export interface BigTimeProject {
  SystemId: number;
  Nm: string;
  DisplayName: string;
  ProjectCode: string;
  ClientId: number;
  StartDt: string;
  EndDt?: string;
  IsInactive: boolean;
  Notes: string;
  StatusProd: number;
  BudgetHours: number;
  BudgetFees: number;
  InputHours: number;
  InputFees: number;
}

export interface BigTimeClient {
  SystemId: number;
  Nm: string;
  LegalNm: string;
  ClientID: string;
  Address: string;
  City: string;
  State: string;
  Zip: string;
  MainPH: string;
  MainFX: string;
  Notes: string;
  FullAddress: string;
  IsInactive: boolean;
}

export class RealBigTimeService implements IBigTimeService {
  private readonly baseUrl: string;
  private readonly firmId: string;
  private readonly apiToken: string;

  constructor() {
    this.baseUrl = process.env.BIGTIME_API_URL || 'https://iq.bigtime.net/BigtimeData/api/v2';
    this.firmId = process.env.BIGTIME_FIRM_ID || '';
    this.apiToken = process.env.BIGTIME_API_TOKEN || '';

    if (!this.firmId || !this.apiToken) {
      console.warn('[BigTime] Missing BIGTIME_FIRM_ID or BIGTIME_API_TOKEN in environment');
    }
  }

  private get headers(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-ApiToken': this.apiToken,
      'X-Auth-Realm': this.firmId,
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    console.log(`[BigTime] ${method} ${url}`);
    const options: RequestInit = {
      method,
      headers: this.headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[BigTime] API error ${response.status}: ${text}`);
      throw new Error(`BigTime API error ${response.status}: ${text}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    // BigTime may return a raw array or an object like { Items: [...] }
    const data = Array.isArray(json) ? json : (json as Record<string, unknown>);
    console.log(`[BigTime] ${method} ${path} -> ${Array.isArray(data) ? data.length + ' items' : typeof data}`);
    return data as T;
  }

  async logTime(_tenantId: string, entry: TimeEntry): Promise<{ success: boolean; entryId: string }> {
    const body: Record<string, unknown> = {
      dt: entry.date.split('T')[0],
      hours_in: entry.hours,
      notes: entry.note,
    };

    if (entry.staffSid) {
      body.staffsid = entry.staffSid;
    } else {
      body.staffLinkValue = entry.userId;
      body.staffLinkType = 3; // FindByEMail
    }

    body.projectsid = parseInt(entry.projectId, 10);

    console.log(`[BigTime] Logging ${entry.hours}h for project ${entry.projectId}`);

    const result = await this.request<{ TimeSID: number }>('POST', '/time', body);
    return {
      success: true,
      entryId: String(result.TimeSID || `BT-${Date.now()}`),
    };
  }

  async getProjectHours(_tenantId: string, projectId: string): Promise<number> {
    try {
      const project = await this.request<BigTimeProject>('GET', `/project/${projectId}`);
      return project.InputHours || 0;
    } catch {
      console.warn(`[BigTime] Could not fetch hours for project ${projectId}`);
      return 0;
    }
  }

  async getStaff(): Promise<BigTimeStaffMember[]> {
    return this.request<BigTimeStaffMember[]>('GET', '/staff');
  }

  async getProjects(): Promise<BigTimeProject[]> {
    return this.request<BigTimeProject[]>('GET', '/project');
  }

  async getClients(): Promise<BigTimeClient[]> {
    return this.request<BigTimeClient[]>('GET', '/client');
  }

  async getProjectDetail(projectSid: number): Promise<BigTimeProject | null> {
    try {
      return await this.request<BigTimeProject>('GET', `/project/${projectSid}`);
    } catch {
      return null;
    }
  }
}

export class StubBigTimeService implements IBigTimeService {
  async logTime(_tenantId: string, entry: TimeEntry): Promise<{ success: boolean; entryId: string }> {
    console.log(`[STUB BigTime] Logging ${entry.hours}h for project ${entry.projectId}`);
    return { success: true, entryId: `BT-${Date.now()}` };
  }

  async getProjectHours(_tenantId: string, _projectId: string): Promise<number> {
    return 24.5;
  }

  async getStaff(): Promise<BigTimeStaffMember[]> {
    return [];
  }

  async getProjects(): Promise<BigTimeProject[]> {
    return [];
  }

  async getClients(): Promise<BigTimeClient[]> {
    return [];
  }

  async getProjectDetail(_projectSid: number): Promise<BigTimeProject | null> {
    return null;
  }
}
