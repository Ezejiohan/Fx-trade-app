import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';

class FundDto {
  userId: string;
  currency: string;
  amount: number;
}

class ConvertDto {
  userId: string;
  from: string;
  to: string;
  amount: number;
}

@Controller('wallet')
export class WalletsController {
  constructor(private wallets: WalletsService) {}

  @Get()
  async getBalances(@Body() body: { userId: string }) {
    return this.wallets.getBalances(body.userId);
  }

  @Post('fund')
  async fund(@Body() body: FundDto) {
    return this.wallets.fund({ id: body.userId }, body.currency, body.amount);
  }

  @Post('convert')
  async convert(@Body() body: ConvertDto) {
    return this.wallets.convert({ id: body.userId }, body.from, body.to, body.amount);
  }
}
