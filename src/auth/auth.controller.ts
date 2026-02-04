import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  email: string;
}

class VerifyDto {
  email: string;
  otp: string;
}

/**
 * AuthController exposes endpoints for registration and OTP verification.
 * In development these endpoints are simple and use email+OTP; in production
 * a token-based flow would be appropriate.
 */
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  async register(@Body() body: RegisterDto) {
    // Creates user and triggers OTP email
    return this.auth.register(body.email);
  }

  // POST /api/auth/verify
  @Post('verify')
  async verify(@Body() body: VerifyDto) {
    // Validates OTP and activates the user
    const ok = await this.auth.verify(body.email, body.otp);
    return { success: Boolean(ok) };
  }
}
