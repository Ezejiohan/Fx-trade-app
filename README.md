# FX Trading Backend (NestJS)

This repository contains a minimal NestJS backend implementation for the FX Trading App assessment.

## Quick start

### Option 1: Local development (SQLite + in-memory cache)
Best for quick prototyping without external services.

1. Copy `.env.example` to `.env` (or use defaults):
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run start:dev
```

Server starts on `http://localhost:3000`.

### Option 2: Docker Compose (Postgres + Redis)
Recommended for realistic local testing with real DB and Redis.

1. Start services:
```bash
docker-compose up -d
```

2. Set `.env` with Postgres credentials:
```env
DATABASE_URL=postgres://fx_user:fx_password@localhost:5432/fx_trading
REDIS_URL=redis://127.0.0.1:6379
```

3. Install and run:
```bash
npm install
npm run start:dev
```

Services are healthy in ~10 seconds; server is ready on `http://localhost:3000`.

Stop services:
```bash
docker-compose down
```

## Testing

Run tests:
```bash
npm run test
```

Watch mode:
```bash
npm run test:watch
```

With coverage:
```bash
npm run test:cov
```

Test suite includes:
- Wallet conversion with real-time FX rates
- Balance sufficiency checks
- Atomicity and balance updates
- Multi-currency support

## What is included

- Minimal NestJS app with modules: `Auth`, `Users`, `Wallets`, `Transactions`, `Fx`
- TypeORM entities for `User`, `WalletBalance`, and `Transaction`
- Redis caching with in-memory fallback (OTP store, FX rates)
- Email OTP flow via `nodemailer` (configure SMTP in `.env`)
- Wallet multi-currency support (NGN, USD, EUR, GBP, etc.)
- Real-time FX rate fetching and conversion logic

## API Endpoints

### Auth
- `POST /api/auth/register` — Register user and send OTP email
- `POST /api/auth/verify` — Verify OTP and activate account

### Wallets
- `GET /api/wallet` — Get user wallet balances
- `POST /api/wallet/fund` — Fund wallet in any currency
- `POST /api/wallet/convert` — Convert between currencies

### FX
- `GET /api/fx/rates` — Fetch current rates (future endpoint)

### Transactions
- `GET /api/transactions` — View transaction history (future endpoint)

## Example requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

### Fund Wallet
```bash
curl -X POST http://localhost:3000/api/wallet/fund \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user-id>","currency":"NGN","amount":5000}'
```

### Convert Currency
```bash
curl -X POST http://localhost:3000/api/wallet/convert \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user-id>","from":"NGN","to":"USD","amount":1000}'
```

## Notes and assumptions

- **Database**: Uses PostgreSQL by default (set via `DATABASE_URL`); falls back to SQLite for local dev without env vars.
- **OTP Storage**: Redis with 10-minute TTL; in-memory fallback if Redis unavailable.
- **FX Rates**: Cached in Redis for 1 minute; external API fallback if cache misses.
- **Precision**: Numeric amounts stored as strings in DB to preserve decimal precision.
- **Atomicity**: Multi-step operations (fund, convert) use transaction-like patterns; consider adding explicit DB transactions for production.
- **Email**: Disabled by default; configure `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST` to enable.

## Next steps / Future enhancements

- Add role-based access control (Admin / User).
- Add explicit transaction logging for all wallet operations.
- Add rate-limiting and input validation middleware.
- Add Swagger OpenAPI documentation.
- Add idempotency keys for duplicate request handling.
- Extend to support more currencies and trading pairs dynamically.
- Performance: Add connection pooling, query optimization, and caching strategies.

