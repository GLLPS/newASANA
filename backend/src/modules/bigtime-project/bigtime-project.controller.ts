import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { BigtimeProjectService } from './bigtime-project.service';
import { CreateBigtimeProjectDto } from './dto/create-bigtime-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard)
@Controller('bigtime-projects')
export class BigtimeProjectController {
  constructor(private bigtimeProjectService: BigtimeProjectService) {}

  @Get('by-client/:clientId')
  findAllByClient(
    @TenantId() tenantId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.bigtimeProjectService.findAllByClient(tenantId, clientId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bigtimeProjectService.findOne(tenantId, id);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateBigtimeProjectDto,
  ) {
    return this.bigtimeProjectService.create(tenantId, dto);
  }
}
