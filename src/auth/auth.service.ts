import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../shared/mail.service';
import { RedisService } from '../shared/redis.service';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(private users: UsersService, private mail: MailService, private redis: RedisService) {}

  async register(email: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) return existing;
    const user = await this.users.create(email);
    await this.sendOtp(email);
    return user;
  }

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // store OTP in Redis (or fallback) for 10 minutes
    await this.redis.set(`otp:${email}`, otp, 60 * 10);
    await this.mail.sendMail(email, 'Your verification OTP', `OTP: ${otp}`);
    this.logger.log(`Sent OTP to ${email}`);
  }

  async verify(email: string, otp: string) {
    const expected = await this.redis.get(`otp:${email}`);
    if (expected === otp) {
      await this.redis.del(`otp:${email}`);
      return this.users.setVerifiedByEmail(email);
    }
    return false;
  }
}
