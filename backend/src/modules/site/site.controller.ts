import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sites')
export class SiteController {
  constructor(private siteService: SiteService) {}

  @Get('by-client/:clientId')
  findAllByClient(
    @TenantId() tenantId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.siteService.findAllByClient(tenantId, clientId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.siteService.findOne(tenantId, id);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateSiteDto) {
    return this.siteService.create(tenantId, dto);
  }
}
