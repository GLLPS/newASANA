import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.action.findMany({
      where: { tenantId },
      include: {
        finding: true,
        inspection: true,
      },
    });
  }

  async findByClient(tenantId: string, clientId: string) {
    return this.prisma.action.findMany({
      where: { tenantId, clientId },
      include: {
        finding: true,
        inspection: true,
      },
    });
  }

  async findOpenByClient(tenantId: string, clientId: string) {
    return this.prisma.action.findMany({
      where: { tenantId, clientId, status: 'Open' },
      include: {
        finding: true,
        inspection: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const action = await this.prisma.action.findFirst({
      where: { id, tenantId },
      include: {
        auditLogs: true,
      },
    });
    if (!action) throw new NotFoundException(`Action ${id} not found`);
    return action;
  }

  async create(tenantId: string, dto: CreateActionDto) {
    return this.prisma.action.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        siteId: dto.siteId,
        inspectionId: dto.inspectionId,
        findingId: dto.findingId,
        description: dto.description,
        responsibleName: dto.responsibleName,
        responsibleEmail: dto.responsibleEmail,
        dueDate: new Date(dto.dueDate),
        status: 'Open',
      },
    });
  }

  async close(tenantId: string, id: string, userId: string, note?: string) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.action.update({
      where: { id },
      data: {
        status: 'Closed',
        closedByUserId: userId,
        closedAt: new Date(),
      },
    });

    await this.prisma.actionAuditLog.create({
      data: {
        tenantId,
        actionId: id,
        previousStatus: 'Open',
        newStatus: 'Closed',
        changedByUserId: userId,
        note,
      },
    });

    return updated;
  }

  async reopen(
    tenantId: string,
    id: string,
    userId: string,
    newDueDate: string,
    reason: string,
  ) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.action.update({
      where: { id },
      data: {
        status: 'Open',
        dueDate: new Date(newDueDate),
        closedByUserId: null,
        closedAt: null,
      },
    });

    await this.prisma.actionAuditLog.create({
      data: {
        tenantId,
        actionId: id,
        previousStatus: 'Closed',
        newStatus: 'Open',
        changedByUserId: userId,
        note: reason,
      },
    });

    return updated;
  }
}
