import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IEmailService, EmailMessage } from '../../integrations/email.service';

@Injectable()
export class WeeklySummaryService {
  constructor(
    private prisma: PrismaService,
    @Inject('IEmailService') private emailService: IEmailService,
  ) {}

  async sendWeeklySummary(tenantId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId },
    });

    if (!client || !client.weeklySummaryEnabled) {
      return { sent: false, reason: 'Weekly summary disabled or client not found' };
    }

    const openActions = await this.prisma.action.findMany({
      where: { tenantId, clientId, status: 'Open' },
      include: { finding: true, inspection: true, site: true },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 86400000);

    const overdue = openActions.filter(a => a.dueDate < now);
    const dueSoon = openActions.filter(a => a.dueDate >= now && a.dueDate <= oneWeek);
    const future = openActions.filter(a => a.dueDate > oneWeek);

    const contacts = await this.prisma.contact.findMany({
      where: { tenantId, clientId, receiveInspectionsDefault: true },
    });

    if (contacts.length === 0) {
      return { sent: false, reason: 'No contacts configured to receive summaries' };
    }

    const body = this.formatSummary(client.name, overdue, dueSoon, future);

    const message: EmailMessage = {
      to: contacts.map(c => c.email),
      subject: `Weekly Safety Summary - ${client.name}`,
      body,
    };

    await this.emailService.sendEmail(tenantId, message);

    return {
      sent: true,
      recipientCount: contacts.length,
      actionCounts: {
        overdue: overdue.length,
        dueSoon: dueSoon.length,
        future: future.length,
      },
    };
  }

  async sendAllWeeklySummaries(tenantId: string) {
    const clients = await this.prisma.client.findMany({
      where: { tenantId, weeklySummaryEnabled: true },
    });

    const results = [];
    for (const client of clients) {
      const result = await this.sendWeeklySummary(tenantId, client.id);
      results.push({ clientId: client.id, clientName: client.name, ...result });
    }
    return results;
  }

  private formatSummary(clientName: string, overdue: any[], dueSoon: any[], future: any[]): string {
    let body = `Weekly Safety Action Summary for ${clientName}\n\n`;

    if (overdue.length > 0) {
      body += `OVERDUE (${overdue.length}):\n`;
      for (const a of overdue) {
        body += `  - ${a.description} (Due: ${a.dueDate.toLocaleDateString()}, Site: ${a.site?.name ?? 'N/A'})\n`;
      }
      body += '\n';
    }

    if (dueSoon.length > 0) {
      body += `DUE SOON (${dueSoon.length}):\n`;
      for (const a of dueSoon) {
        body += `  - ${a.description} (Due: ${a.dueDate.toLocaleDateString()}, Site: ${a.site?.name ?? 'N/A'})\n`;
      }
      body += '\n';
    }

    if (future.length > 0) {
      body += `UPCOMING (${future.length}):\n`;
      for (const a of future) {
        body += `  - ${a.description} (Due: ${a.dueDate.toLocaleDateString()}, Site: ${a.site?.name ?? 'N/A'})\n`;
      }
    }

    if (overdue.length === 0 && dueSoon.length === 0 && future.length === 0) {
      body += 'No open corrective actions. Great work!\n';
    }

    return body;
  }
}
