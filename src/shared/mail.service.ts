import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RedisService } from './redis.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger('MailService');

  constructor(private readonly redis?: RedisService) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      if (!this.transporter) return this.logger.warn('No transporter configured');
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (err) {
      this.logger.error('Failed to send email', err as any);
    }
  }
}
