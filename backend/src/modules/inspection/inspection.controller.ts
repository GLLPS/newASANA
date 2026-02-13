import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { InspectionSubmitService } from './inspection-submit.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { SubmitInspectionDto } from './dto/submit-inspection.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('inspections')
export class InspectionController {
  constructor(
    private inspectionService: InspectionService,
    private inspectionSubmitService: InspectionSubmitService,
  ) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.inspectionService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.inspectionService.findOne(tenantId, id);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateInspectionDto,
  ) {
    return this.inspectionService.create(tenantId, dto);
  }

  @Post(':id/submit')
  submit(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitInspectionDto,
  ) {
    return this.inspectionSubmitService.submit(tenantId, id, user.sub, dto);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() data: Partial<CreateInspectionDto>,
  ) {
    return this.inspectionService.update(tenantId, id, data);
  }
}
