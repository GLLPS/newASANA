import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkItemDto } from './dto/create-work-item.dto';

@Injectable()
export class WorkItemService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.workItem.findMany({
      where: { tenantId },
      include: {
        client: true,
        bigtimeProject: true,
        site: true,
        assignedTo: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findByUser(tenantId: string, userId: string) {
    return this.prisma.workItem.findMany({
      where: { tenantId, assignedToUserId: userId },
      include: {
        client: true,
        bigtimeProject: true,
        site: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findByWeek(
    tenantId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.workItem.findMany({
      where: {
        tenantId,
        assignedToUserId: userId,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: true,
        bigtimeProject: true,
        site: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const workItem = await this.prisma.workItem.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        bigtimeProject: true,
        site: true,
        assignedTo: {
          select: { id: true, email: true, role: true },
        },
      },
    });
    if (!workItem) throw new NotFoundException(`WorkItem ${id} not found`);
    return workItem;
  }

  async create(tenantId: string, dto: CreateWorkItemDto) {
    return this.prisma.workItem.create({
      data: {
        tenantId,
        externalSource: dto.externalSource,
        externalId: dto.externalId,
        type: dto.type,
        clientId: dto.clientId,
        bigtimeProjectId: dto.bigtimeProjectId,
        siteId: dto.siteId,
        assignedToUserId: dto.assignedToUserId,
        scheduledDate: new Date(dto.scheduledDate),
      },
      include: {
        client: true,
        bigtimeProject: true,
        site: true,
        assignedTo: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  /**
   * Seed demo work items for this week using existing synced data.
   * Picks up to 3 BigTime projects, creates sites if needed, and
   * schedules inspection work items for this week.
   */
  async seedDemoWeek(tenantId: string, userId: string) {
    // Find synced BigTime projects with their clients
    const projects = await this.prisma.bigTimeProject.findMany({
      where: { tenantId },
      include: { client: true },
      take: 3,
    });

    if (projects.length === 0) {
      return { message: 'No synced BigTime projects found. Run BigTime sync first.', created: 0 };
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);

    const siteNames = [
      'Downtown Tower Project',
      'Highway Bridge Renovation',
      'Warehouse Distribution Center',
    ];

    const created: string[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];

      // Ensure a site exists for this client
      let site = await this.prisma.site.findFirst({
        where: { tenantId, clientId: project.clientId },
      });

      if (!site) {
        site = await this.prisma.site.create({
          data: {
            tenantId,
            clientId: project.clientId,
            name: siteNames[i] || `${project.client.name} - Main Site`,
          },
        });
      }

      // Schedule date: spread across the week (Mon, Wed, Fri)
      const schedDate = new Date(monday);
      schedDate.setDate(monday.getDate() + i * 2); // Mon=0, Wed=2, Fri=4

      // Check for existing work item to avoid duplicates
      const existing = await this.prisma.workItem.findFirst({
        where: {
          tenantId,
          bigtimeProjectId: project.id,
          assignedToUserId: userId,
          scheduledDate: {
            gte: new Date(schedDate.getFullYear(), schedDate.getMonth(), schedDate.getDate()),
            lt: new Date(schedDate.getFullYear(), schedDate.getMonth(), schedDate.getDate() + 1),
          },
        },
      });

      if (!existing) {
        await this.prisma.workItem.create({
          data: {
            tenantId,
            externalSource: 'demo',
            externalId: `demo-${project.bigtimeProjectId}-${i}`,
            type: 'Inspection',
            clientId: project.clientId,
            bigtimeProjectId: project.id,
            siteId: site.id,
            assignedToUserId: userId,
            scheduledDate: schedDate,
          },
        });
        created.push(`${project.client.name} - ${site.name} (${schedDate.toLocaleDateString()})`);
      }
    }

    return {
      message: `Created ${created.length} demo work item(s) for this week.`,
      created: created.length,
      items: created,
    };
  }
}
