import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.client.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
    });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async create(tenantId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        tenantId,
        name: dto.name,
        weeklySummaryEnabled: dto.weeklySummaryEnabled ?? false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: Partial<CreateClientDto>) {
    await this.findOne(tenantId, id);
    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }
}
