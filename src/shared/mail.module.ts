import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { RedisService } from './redis.service';

@Module({
  providers: [MailService, RedisService],
  exports: [MailService, RedisService],
})
export class MailModule {}
