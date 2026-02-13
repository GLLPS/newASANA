import { Module } from '@nestjs/common';
import { WorkItemService } from './work-item.service';
import { WorkItemController } from './work-item.controller';

@Module({
  controllers: [WorkItemController],
  providers: [WorkItemService],
  exports: [WorkItemService],
})
export class WorkItemModule {}
