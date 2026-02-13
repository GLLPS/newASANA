import { Module } from '@nestjs/common';
import { FindingService } from './finding.service';
import { FindingController } from './finding.controller';

@Module({
  controllers: [FindingController],
  providers: [FindingService],
  exports: [FindingService],
})
export class FindingModule {}
