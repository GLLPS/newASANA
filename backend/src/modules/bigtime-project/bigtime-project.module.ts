import { Module } from '@nestjs/common';
import { BigtimeProjectService } from './bigtime-project.service';
import { BigtimeProjectController } from './bigtime-project.controller';

@Module({
  controllers: [BigtimeProjectController],
  providers: [BigtimeProjectService],
  exports: [BigtimeProjectService],
})
export class BigtimeProjectModule {}
