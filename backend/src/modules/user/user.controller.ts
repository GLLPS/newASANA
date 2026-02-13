import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.userService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.userService.findOne(tenantId, id);
  }

  @Post()
  @Roles('Admin')
  create(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    return this.userService.create(tenantId, dto);
  }
}
