import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get('by-client/:clientId')
  findAllByClient(
    @TenantId() tenantId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.contactService.findAllByClient(tenantId, clientId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contactService.findOne(tenantId, id);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateContactDto) {
    return this.contactService.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateContactDto>,
  ) {
    return this.contactService.update(tenantId, id, dto);
  }
}
