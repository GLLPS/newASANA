import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFindingDto } from './dto/create-finding.dto';

@Injectable()
export class FindingService {
  constructor(private prisma: PrismaService) {}

  async findByInspection(tenantId: string, inspectionId: string) {
    return this.prisma.finding.findMany({
      where: { tenantId, inspectionId },
    });
  }

  async findOne(tenantId: string, id: string) {
    const finding = await this.prisma.finding.findFirst({
      where: { id, tenantId },
    });
    if (!finding) throw new NotFoundException(`Finding ${id} not found`);
    return finding;
  }

  async create(tenantId: string, dto: CreateFindingDto) {
    return this.prisma.finding.create({
      data: {
        tenantId,
        inspectionId: dto.inspectionId,
        category: dto.category,
        observation: dto.observation,
        comment: dto.comment,
        status: dto.status,
        severity: dto.severity,
        riskType: dto.riskType,
        oshaRef: dto.oshaRef,
        correctedOnSite: dto.correctedOnSite ?? false,
        requiredOverride: false,
      },
    });
  }

  async update(tenantId: string, id: string, data: Partial<CreateFindingDto>) {
    await this.findOne(tenantId, id);
    return this.prisma.finding.update({
      where: { id },
      data,
    });
  }
}
