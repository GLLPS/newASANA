import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'photos');

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

  async addPhoto(
    tenantId: string,
    inspectionId: string,
    file: Express.Multer.File,
  ) {
    await this.findOne(tenantId, inspectionId);

    const dir = path.join(UPLOADS_DIR, inspectionId);
    fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(file.originalname) || '.jpg';
    const storedName = `${Date.now()}${ext}`;
    const storagePath = path.join(dir, storedName);

    fs.writeFileSync(storagePath, file.buffer);

    return this.prisma.inspectionPhoto.create({
      data: {
        tenantId,
        inspectionId,
        fileName: file.originalname,
        storagePath: `/uploads/photos/${inspectionId}/${storedName}`,
        mimeType: file.mimetype,
      },
    });
  }

  async getPhotos(tenantId: string, inspectionId: string) {
    await this.findOne(tenantId, inspectionId);
    return this.prisma.inspectionPhoto.findMany({
      where: { tenantId, inspectionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deletePhoto(tenantId: string, photoId: string) {
    const photo = await this.prisma.inspectionPhoto.findFirst({
      where: { id: photoId, tenantId },
    });
    if (!photo) throw new NotFoundException(`Photo ${photoId} not found`);

    const fullPath = path.join(process.cwd(), photo.storagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.prisma.inspectionPhoto.delete({ where: { id: photoId } });
  }
}
