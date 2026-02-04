import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletBalance } from './wallet-balance.entity';
import { FxService } from '../fx/fx.service';

@Injectable()
export class WalletsService {
  private logger = new Logger('WalletsService');
  constructor(@InjectRepository(WalletBalance) private repo: Repository<WalletBalance>, private fx: FxService) {}

  async getBalances(userId: string) {
    const items = await this.repo.find({ where: { user: { id: userId } }, relations: ['user'] });
    return items.map(i => ({ currency: i.currency, amount: i.amount }));
  }

  async ensureBalance(user: any, currency: string) {
    let bal = await this.repo.findOne({ where: { user: { id: user.id }, currency }, relations: ['user'] });
    if (!bal) {
      bal = this.repo.create({ user, currency, amount: '0' });
      bal = await this.repo.save(bal);
    }
    return bal;
  }

  async fund(user: any, currency: string, amount: number) {
    const bal = await this.ensureBalance(user, currency);
    bal.amount = (Number(bal.amount) + amount).toString();
    return this.repo.save(bal);
  }

  async convert(user: any, from: string, to: string, amount: number) {
    // Ensure both source and destination balances exist (creates zero-balance records if needed)
    const fromBal = await this.ensureBalance(user, from);
    const toBal = await this.ensureBalance(user, to);

    // Prevent double-spend: check available balance before proceeding
    if (Number(fromBal.amount) < amount) throw new Error('Insufficient balance');

    // Ask FX service for the conversion rate (how many `to` units per 1 `from` unit)
    const rate = await this.fx.getRate(from, to);

    // Calculate received amount and update both balances
    const received = Number((amount * rate).toFixed(8));
    fromBal.amount = (Number(fromBal.amount) - amount).toString();
    toBal.amount = (Number(toBal.amount) + received).toString();

    // Persist changes. In production wrap this in a DB transaction to ensure atomicity.
    await this.repo.save(fromBal);
    await this.repo.save(toBal);
    this.logger.log(`Converted ${amount} ${from} -> ${received} ${to} @${rate}`);
    return { from: fromBal, to: toBal, rate, received };
  }
}
