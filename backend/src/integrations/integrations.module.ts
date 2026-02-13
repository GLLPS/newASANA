import { Global, Module } from '@nestjs/common';
import { StubWorkSourceService } from './work-source.service';
import { StubBigTimeService } from './bigtime.service';
import { StubSharePointService } from './sharepoint.service';
import { StubEmailService } from './email.service';

const workSourceProvider = {
  provide: 'IWorkSourceService',
  useClass: StubWorkSourceService,
};

const bigTimeProvider = {
  provide: 'IBigTimeService',
  useClass: StubBigTimeService,
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
  providers: [workSourceProvider, bigTimeProvider, sharePointProvider, emailProvider],
  exports: [workSourceProvider, bigTimeProvider, sharePointProvider, emailProvider],
})
export class IntegrationsModule {}
