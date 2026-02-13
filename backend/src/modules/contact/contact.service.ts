import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async findAllByClient(tenantId: string, clientId: string) {
    return this.prisma.contact.findMany({
      where: { tenantId, clientId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
    });
    if (!contact) throw new NotFoundException(`Contact ${id} not found`);
    return contact;
  }

  async create(tenantId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        name: dto.name,
        email: dto.email,
        receiveInspectionsDefault: dto.receiveInspectionsDefault ?? false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: Partial<CreateContactDto>) {
    await this.findOne(tenantId, id);
    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }
}
