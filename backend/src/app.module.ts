import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { ClientModule } from './modules/client/client.module';
import { ContactModule } from './modules/contact/contact.module';
import { SiteModule } from './modules/site/site.module';
import { BigtimeProjectModule } from './modules/bigtime-project/bigtime-project.module';
import { WorkItemModule } from './modules/work-item/work-item.module';
import { InspectionModule } from './modules/inspection/inspection.module';
import { FindingModule } from './modules/finding/finding.module';
import { ActionModule } from './modules/action/action.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    IntegrationsModule,
    AuthModule,
    TenantModule,
    UserModule,
    ClientModule,
    ContactModule,
    SiteModule,
    BigtimeProjectModule,
    WorkItemModule,
    InspectionModule,
    FindingModule,
    ActionModule,
  ],
})
export class AppModule {}
