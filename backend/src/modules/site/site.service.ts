import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  async findAllByClient(tenantId: string, clientId: string) {
    return this.prisma.site.findMany({
      where: { tenantId, clientId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const site = await this.prisma.site.findFirst({
      where: { id, tenantId },
    });
    if (!site) throw new NotFoundException(`Site ${id} not found`);
    return site;
  }

  async create(tenantId: string, dto: CreateSiteDto) {
    return this.prisma.site.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        name: dto.name,
      },
    });
  }
}
