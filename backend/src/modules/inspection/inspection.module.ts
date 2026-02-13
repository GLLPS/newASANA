import { Module } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { InspectionSubmitService } from './inspection-submit.service';
import { WeeklySummaryService } from './weekly-summary.service';
import { InspectionController } from './inspection.controller';

@Module({
  controllers: [InspectionController],
  providers: [InspectionService, InspectionSubmitService, WeeklySummaryService],
  exports: [InspectionService, InspectionSubmitService, WeeklySummaryService],
})
export class InspectionModule {}
