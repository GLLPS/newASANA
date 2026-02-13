import { Global, Module } from '@nestjs/common';
import { config } from 'dotenv';
import { StubWorkSourceService } from './work-source.service';
import { RealBigTimeService, StubBigTimeService } from './bigtime.service';
import { StubSharePointService } from './sharepoint.service';
import { StubEmailService } from './email.service';
import { BigTimeSyncService } from './bigtime-sync.service';
import { BigTimeSyncController } from './bigtime-sync.controller';

// Ensure .env is loaded before provider factories run
config();

const workSourceProvider = {
  provide: 'IWorkSourceService',
  useClass: StubWorkSourceService,
};

const bigTimeProvider = {
  provide: 'IBigTimeService',
  useFactory: () => {
    const token = process.env.BIGTIME_API_TOKEN;
    const firmId = process.env.BIGTIME_FIRM_ID;
    if (token && firmId) {
      console.log('[Integrations] Using LIVE BigTime API service');
      return new RealBigTimeService();
    }
    console.log('[Integrations] Using STUB BigTime service (no credentials found)');
    return new StubBigTimeService();
  },
};

const sharePointProvider = {
  provide: 'ISharePointService',
  useClass: StubSharePointService,
};

const emailProvider = {
  provide: 'IEmailService',
  useClass: StubEmailService,
};

@Global()
@Module({
  controllers: [BigTimeSyncController],
  providers: [
    workSourceProvider,
    bigTimeProvider,
    sharePointProvider,
    emailProvider,
    BigTimeSyncService,
  ],
  exports: [workSourceProvider, bigTimeProvider, sharePointProvider, emailProvider, BigTimeSyncService],
})
export class IntegrationsModule {}
