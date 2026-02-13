import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBigtimeProjectDto } from './dto/create-bigtime-project.dto';

@Injectable()
export class BigtimeProjectService {
  constructor(private prisma: PrismaService) {}

  async findAllByClient(tenantId: string, clientId: string) {
    return this.prisma.bigTimeProject.findMany({
      where: { tenantId, clientId },
      orderBy: { bigtimeProjectId: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const project = await this.prisma.bigTimeProject.findFirst({
      where: { id, tenantId },
    });
    if (!project)
      throw new NotFoundException(`BigTimeProject ${id} not found`);
    return project;
  }

  async create(tenantId: string, dto: CreateBigtimeProjectDto) {
    return this.prisma.bigTimeProject.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        bigtimeProjectId: dto.bigtimeProjectId,
        sharepointFolderId: dto.sharepointFolderId,
      },
    });
  }
}
