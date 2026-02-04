import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FxModule } from './fx/fx.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (url) {
          return {
            type: 'postgres',
            url,
            synchronize: true,
            autoLoadEntities: true,
          } as any;
        }
        // Fallback to local SQLite for quick local testing without DB setup
        return {
          type: 'sqlite',
          database: process.env.SQLITE_DB || 'dev.db',
          synchronize: true,
          autoLoadEntities: true,
        } as any;
      },
    }),
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    FxModule,
  ],
})
export class AppModule {}
