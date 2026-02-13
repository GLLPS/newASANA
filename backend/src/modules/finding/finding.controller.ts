import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
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
}
