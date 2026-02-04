import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  email: string;
}

class VerifyDto {
  email: string;
  otp: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.auth.register(body.email);
  }

  @Post('verify')
  async verify(@Body() body: VerifyDto) {
    const ok = await this.auth.verify(body.email, body.otp);
    return { success: Boolean(ok) };
  }
}
