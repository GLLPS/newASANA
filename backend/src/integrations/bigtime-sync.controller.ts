import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BigTimeSyncService } from './bigtime-sync.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard)
@Controller('bigtime')
export class BigTimeSyncController {
  constructor(private syncService: BigTimeSyncService) {}

  /** Quick connectivity test — fetches clients and returns count */
  @Get('status')
  status() {
    return this.syncService.checkConnection();
  }

  /** Sync all BigTime data (clients, projects, staff) into local DB */
  @Post('sync')
  syncAll(@TenantId() tenantId: string) {
    return this.syncService.syncAll(tenantId);
  }

  /** Sync only clients */
  @Post('sync/clients')
  syncClients(@TenantId() tenantId: string) {
    return this.syncService.syncClients(tenantId);
  }

  /** Sync only projects */
  @Post('sync/projects')
  syncProjects(@TenantId() tenantId: string) {
    return this.syncService.syncProjects(tenantId);
  }

  /** Sync only staff */
  @Post('sync/staff')
  syncStaff(@TenantId() tenantId: string) {
    return this.syncService.syncStaff(tenantId);
  }

  /** Get raw BigTime staff data (no sync, just API passthrough) */
  @Get('staff')
  getStaff() {
    return this.syncService.getStaffDirect();
  }

  /** Get raw BigTime projects data (no sync, just API passthrough) */
  @Get('projects')
  getProjects() {
    return this.syncService.getProjectsDirect();
  }

  /** Get raw BigTime clients data (no sync, just API passthrough) */
  @Get('clients')
  getClients() {
    return this.syncService.getClientsDirect();
  }
}
