import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FxModule } from './fx/fx.module';

/**
 * Root application module.
 * - Loads configuration globally via `@nestjs/config`
 * - Configures TypeORM (Postgres via DATABASE_URL or local SQLite fallback)
 * - Registers feature modules (Auth, Users, Wallets, Transactions, Fx)
 */
@Module({
  imports: [
    // Load .env and make env variables available app-wide
    ConfigModule.forRoot({ isGlobal: true }),

    // Configure TypeORM asynchronously using environment variables
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (url) {
          // Production-like configuration using Postgres
          return {
            type: 'postgres',
            url,
            synchronize: true, // NOTE: for development only
            autoLoadEntities: true,
          } as any;
        }

        // Fallback to local SQLite for quick local development/testing
        return {
          type: 'sqlite',
          database: process.env.SQLITE_DB || 'dev.db',
          synchronize: true,
          autoLoadEntities: true,
        } as any;
      },
    }),

    // Application feature modules
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    FxModule,
  ],
})
export class AppModule {}
