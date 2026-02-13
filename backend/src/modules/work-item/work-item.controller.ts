import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { WorkItemService } from './work-item.service';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('work-items')
export class WorkItemController {
  constructor(private workItemService: WorkItemService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.workItemService.findAll(tenantId);
  }

  @Get('my-week')
  myWeek(@TenantId() tenantId: string, @CurrentUser() user: JwtPayload) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return this.workItemService.findByWeek(
      tenantId,
      user.sub,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workItemService.findOne(tenantId, id);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateWorkItemDto,
  ) {
    return this.workItemService.create(tenantId, dto);
  }
}
