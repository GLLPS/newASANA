import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindingService } from './finding.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard)
@Controller('findings')
export class FindingController {
  constructor(private findingService: FindingService) {}

  @Get('by-inspection/:inspectionId')
  findByInspection(
    @TenantId() tenantId: string,
    @Param('inspectionId') inspectionId: string,
  ) {
    return this.findingService.findByInspection(tenantId, inspectionId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.findingService.findOne(tenantId, id);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateFindingDto) {
    return this.findingService.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() data: Partial<CreateFindingDto>,
  ) {
    return this.findingService.update(tenantId, id, data);
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadPhoto(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.findingService.addPhoto(tenantId, id, file);
  }

  @Get(':id/photos')
  getPhotos(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.findingService.getPhotos(tenantId, id);
  }

  @Delete('photos/:photoId')
  deletePhoto(
    @TenantId() tenantId: string,
    @Param('photoId') photoId: string,
  ) {
    return this.findingService.deletePhoto(tenantId, photoId);
  }
}
