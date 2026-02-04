import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  passwordHash?: string;

  @CreateDateColumn()
  createdAt: Date;
}

// User entity: represents application user.
// - `verified` indicates whether OTP verification completed.
// - `passwordHash` reserved for future password-based auth (not used in this assessment).
