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
}
