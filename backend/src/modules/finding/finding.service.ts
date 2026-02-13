import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFindingDto } from './dto/create-finding.dto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'photos');

@Injectable()
export class FindingService {
  constructor(private prisma: PrismaService) {}

  async findByInspection(tenantId: string, inspectionId: string) {
    return this.prisma.finding.findMany({
      where: { tenantId, inspectionId },
      include: { photos: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const finding = await this.prisma.finding.findFirst({
      where: { id, tenantId },
      include: { photos: true },
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
      include: { photos: true },
    });
  }

  async update(tenantId: string, id: string, data: Partial<CreateFindingDto>) {
    await this.findOne(tenantId, id);
    return this.prisma.finding.update({
      where: { id },
      data,
      include: { photos: true },
    });
  }

  async addPhoto(tenantId: string, findingId: string, file: Express.Multer.File) {
    await this.findOne(tenantId, findingId);

    const dir = path.join(UPLOADS_DIR, findingId);
    fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(file.originalname) || '.jpg';
    const storedName = `${Date.now()}${ext}`;
    const storagePath = path.join(dir, storedName);

    fs.writeFileSync(storagePath, file.buffer);

    return this.prisma.findingPhoto.create({
      data: {
        tenantId,
        findingId,
        fileName: file.originalname,
        storagePath: `/uploads/photos/${findingId}/${storedName}`,
        mimeType: file.mimetype,
      },
    });
  }

  async getPhotos(tenantId: string, findingId: string) {
    await this.findOne(tenantId, findingId);
    return this.prisma.findingPhoto.findMany({
      where: { tenantId, findingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deletePhoto(tenantId: string, photoId: string) {
    const photo = await this.prisma.findingPhoto.findFirst({
      where: { id: photoId, tenantId },
    });
    if (!photo) throw new NotFoundException(`Photo ${photoId} not found`);

    const fullPath = path.join(process.cwd(), photo.storagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.prisma.findingPhoto.delete({ where: { id: photoId } });
  }
}
