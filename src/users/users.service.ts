import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string) {
    const user = this.repo.create({ email });
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  async setVerified(id: string) {
    await this.repo.update(id, { verified: true });
  }

  async setVerifiedByEmail(email: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    user.verified = true;
    return this.repo.save(user);
  }
}
