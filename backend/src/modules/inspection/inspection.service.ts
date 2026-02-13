import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';

@Injectable()
export class InspectionService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.inspection.findMany({
      where: { tenantId },
      include: {
        findings: true,
        site: true,
        bigtimeProject: true,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const inspection = await this.prisma.inspection.findFirst({
      where: { id, tenantId },
      include: {
        findings: true,
        actions: true,
      },
    });
    if (!inspection)
      throw new NotFoundException(`Inspection ${id} not found`);
    return inspection;
  }

  async create(tenantId: string, dto: CreateInspectionDto) {
    return this.prisma.inspection.create({
      data: {
        tenantId,
        workItemId: dto.workItemId,
        bigtimeProjectId: dto.bigtimeProjectId,
        siteId: dto.siteId,
        reportType: dto.reportType,
        status: 'Draft',
      },
    });
  }

  async update(tenantId: string, id: string, data: Partial<CreateInspectionDto>) {
    await this.findOne(tenantId, id);
    return this.prisma.inspection.update({
      where: { id },
      data,
    });
  }
}
