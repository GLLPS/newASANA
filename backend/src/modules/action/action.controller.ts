import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ActionService } from './action.service';
import { CreateActionDto } from './dto/create-action.dto';
import { CloseActionDto } from './dto/close-action.dto';
import { ReopenActionDto } from './dto/reopen-action.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('actions')
export class ActionController {
  constructor(private actionService: ActionService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.actionService.findAll(tenantId);
  }

  @Get('by-client/:clientId')
  findByClient(
    @TenantId() tenantId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.actionService.findByClient(tenantId, clientId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.actionService.findOne(tenantId, id);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateActionDto,
  ) {
    return this.actionService.create(tenantId, dto);
  }

  @Post(':id/close')
  close(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CloseActionDto,
  ) {
    return this.actionService.close(tenantId, id, user.sub, dto.note);
  }

  @Post(':id/reopen')
  reopen(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReopenActionDto,
  ) {
    return this.actionService.reopen(
      tenantId,
      id,
      user.sub,
      dto.newDueDate,
      dto.reason,
    );
  }
}
