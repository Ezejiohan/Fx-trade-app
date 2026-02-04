import { Module } from '@nestjs/common';
import { FxService } from './fx.service';
import { RedisService } from '../shared/redis.service';

@Module({
  providers: [FxService, RedisService],
  exports: [FxService],
})
export class FxModule {}
