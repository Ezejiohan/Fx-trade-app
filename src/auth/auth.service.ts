import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../shared/mail.service';
import { RedisService } from '../shared/redis.service';

/**
 * Authentication service
 * - Handles registration and OTP verification flows
 * - Stores OTP in Redis (or in-memory fallback) with TTL
 * - Sends OTP emails via MailService
 */
@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(private users: UsersService, private mail: MailService, private redis: RedisService) {}

  /**
   * Register a new user. If user exists, returns existing record.
   * After creation, triggers OTP send for email verification.
   */
  async register(email: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) return existing;
    const user = await this.users.create(email);
    await this.sendOtp(email);
    return user;
  }

  /**
   * Generate and store an OTP, then send it by email.
   * OTP TTL: 10 minutes (600 seconds).
   */
  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // store OTP in Redis (or fallback) for 10 minutes
    await this.redis.set(`otp:${email}`, otp, 60 * 10);
    // send OTP via configured mail provider (nodemailer)
    await this.mail.sendMail(email, 'Your verification OTP', `OTP: ${otp}`);
    this.logger.log(`Sent OTP to ${email}`);
  }

  /**
   * Verify OTP: compare value stored in Redis and activate user.
   */
  async verify(email: string, otp: string) {
    const expected = await this.redis.get(`otp:${email}`);
    if (expected === otp) {
      await this.redis.del(`otp:${email}`);
      return this.users.setVerifiedByEmail(email);
    }
    return false;
  }
}
