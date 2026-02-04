import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../shared/redis.service';

@Injectable()
export class FxService {
  private cache: Record<string, number> = {};
  private lastFetched = 0;
  private ttl = 60 * 1000; // 1 minute
  private logger = new Logger('FxService');

  constructor(private redis: RedisService) {}

  async fetchRates(base = process.env.FX_BASE || 'NGN') {
    const now = Date.now();
    // try redis first
    try {
      const cached = await this.redis.get(`fx:${base}`);
      if (cached) return JSON.parse(cached) as Record<string, number>;
    } catch (err) {
      this.logger.warn('Redis get failed for FX cache');
    }

    if (now - this.lastFetched < this.ttl && Object.keys(this.cache).length) return this.cache;
    try {
      const url = `${process.env.FX_API_URL || 'https://open.er-api.com/v6/latest'}/${base}`;
      const res = await axios.get(url);
      const rates = res.data && res.data.rates ? res.data.rates : {};
      this.cache = rates;
      this.lastFetched = Date.now();
      try {
        await this.redis.set(`fx:${base}`, JSON.stringify(rates), Math.floor(this.ttl / 1000));
      } catch (e) {
        this.logger.warn('Redis set failed for FX cache');
      }
      return rates;
    } catch (err) {
      this.logger.error('Failed to fetch FX rates, using cached', err as any);
      return this.cache;
    }
  }

  async getRate(from: string, to: string) {
    // simplistic approach via base NGN rates
    const base = process.env.FX_BASE || 'NGN';
    const rates = await this.fetchRates(base);
    if (from === to) return 1;
    const rateFrom = from === base ? 1 : 1 / (rates[from] || 1);
    const rateTo = to === base ? 1 : rates[to] || 1;
    const final = rateFrom * rateTo;
    return final;
  }
}
