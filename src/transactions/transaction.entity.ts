import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @Column()
  type: string; // FUND, CONVERT, TRADE

  @Column('numeric')
  amount: string;

  @Column({ nullable: true })
  currencyFrom: string;

  @Column({ nullable: true })
  currencyTo: string;

  @Column('numeric', { nullable: true })
  rate?: string;

  @CreateDateColumn()
  createdAt: Date;
}
