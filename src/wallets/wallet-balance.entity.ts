import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class WalletBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  currency: string; // e.g., NGN, USD

  @Column('numeric', { default: 0 })
  amount: string; // store as string to preserve precision
}

// WalletBalance entity tracks per-user balance for each currency.
// - We store `amount` as a string to avoid floating point precision issues in examples.
// - For production consider using a decimal/numeric type with an appropriate scale.
