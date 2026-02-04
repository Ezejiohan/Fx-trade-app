import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '../shared/mail.module';
import { RedisService } from '../shared/redis.service';

@Module({
  imports: [UsersModule, MailModule],
  providers: [AuthService, RedisService],
  controllers: [AuthController],
})
export class AuthModule {}
