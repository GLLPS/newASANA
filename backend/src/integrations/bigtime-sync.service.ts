import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IBigTimeService } from './bigtime.service';

@Injectable()
export class BigTimeSyncService {
  constructor(
    private prisma: PrismaService,
    @Inject('IBigTimeService') private bigTimeService: IBigTimeService,
  ) {}

  async syncClients(tenantId: string) {
    const btClients = await this.bigTimeService.getClients();

    // Filter out clients with no name (BigTime has some blank entries)
    const validClients = btClients.filter(c => c.Nm && c.Nm.trim().length > 0);

    let created = 0;
    let updated = 0;

    for (const btClient of validClients) {
      const existing = await this.prisma.client.findFirst({
        where: {
          tenantId,
          name: btClient.Nm,
        },
      });

      if (!existing) {
        await this.prisma.client.create({
          data: {
            tenantId,
            name: btClient.Nm,
            weeklySummaryEnabled: false,
          },
        });
        created++;
      } else {
        updated++;
      }
    }

    return {
      total: validClients.length,
      created,
      alreadyExisted: updated,
    };
  }

  async syncProjects(tenantId: string) {
    const btProjects = await this.bigTimeService.getProjects();
    const btClients = await this.bigTimeService.getClients();

    // Build a lookup map from BigTime ClientId -> client name
    const btClientMap = new Map<number, string>();
    for (const c of btClients) {
      if (c.Nm && c.Nm.trim().length > 0) {
        btClientMap.set(c.SystemId, c.Nm);
      }
    }

    // Filter to active projects only
    const activeProjects = btProjects.filter(p => !p.IsInactive && p.Nm && p.Nm.trim().length > 0);

    let created = 0;
    let skipped = 0;

    for (const btProject of activeProjects) {
      // Find the local client for this project
      const clientName = btClientMap.get(btProject.ClientId);
      if (!clientName) {
        skipped++;
        continue;
      }

      const localClient = await this.prisma.client.findFirst({
        where: { tenantId, name: clientName },
      });

      if (!localClient) {
        skipped++;
        continue;
      }

      // Check if this BigTime project already exists locally
      const existing = await this.prisma.bigTimeProject.findFirst({
        where: {
          tenantId,
          bigtimeProjectId: String(btProject.SystemId),
        },
      });

      if (!existing) {
        await this.prisma.bigTimeProject.create({
          data: {
            tenantId,
            clientId: localClient.id,
            bigtimeProjectId: String(btProject.SystemId),
            name: btProject.Nm || null,
          },
        });
        created++;
      } else if (!existing.name && btProject.Nm) {
        // Backfill name for previously synced projects
        await this.prisma.bigTimeProject.update({
          where: { id: existing.id },
          data: { name: btProject.Nm },
        });
      }
    }

    return {
      totalActive: activeProjects.length,
      created,
      skipped,
    };
  }

  async syncStaff(tenantId: string) {
    const btStaff = await this.bigTimeService.getStaff();

    // Filter to active staff with real emails
    const activeStaff = btStaff.filter(
      s => !s.IsInactive && s.EMail && s.EMail.trim().length > 0 && s.UserAccountStatus !== 'IsDeleted',
    );

    let created = 0;
    let alreadyExisted = 0;

    for (const staff of activeStaff) {
      const email = staff.EMail.toLowerCase();

      const existing = await this.prisma.user.findFirst({
        where: { tenantId, email },
      });

      if (!existing) {
        // Create user with a placeholder password (they'll need to set their own)
        const bcrypt = await import('bcrypt');
        const placeholderHash = await bcrypt.hash(`bigtime-sync-${Date.now()}`, 10);

        await this.prisma.user.create({
          data: {
            tenantId,
            email,
            passwordHash: placeholderHash,
            role: 'Staff',
          },
        });
        created++;
      } else {
        alreadyExisted++;
      }
    }

    return {
      totalActive: activeStaff.length,
      created,
      alreadyExisted,
      staff: activeStaff.map(s => ({
        name: s.FullName,
        email: s.EMail,
        title: s.Title,
        staffSid: s.StaffSID,
      })),
    };
  }

  async getStaffDirect() {
    return this.bigTimeService.getStaff();
  }

  async getProjectsDirect() {
    return this.bigTimeService.getProjects();
  }

  async getClientsDirect() {
    return this.bigTimeService.getClients();
  }

  async checkConnection() {
    try {
      const clients = await this.bigTimeService.getClients();
      const isArray = Array.isArray(clients);
      return {
        connected: true,
        clientCount: isArray ? clients.length : 0,
        raw: isArray ? undefined : clients,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { connected: false, error: message };
    }
  }

  async syncAll(tenantId: string) {
    const clientResult = await this.syncClients(tenantId);
    const projectResult = await this.syncProjects(tenantId);
    const staffResult = await this.syncStaff(tenantId);

    return {
      clients: clientResult,
      projects: projectResult,
      staff: staffResult,
    };
  }
}
