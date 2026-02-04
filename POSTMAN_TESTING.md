# Testing FX Trading API with Postman

## 1. Start the Server

```powershell
# Terminal 1: Start dev server
npm run start:dev
```

Server will start on `http://localhost:3000`

## 2. Set Up Postman Environment

Create a new environment in Postman with these variables:
```json
{
  "base_url": "http://localhost:3000",
  "api_prefix": "/api"
}
```

## 3. Test Endpoints Step-by-Step

### Step 1: Register a User

**Endpoint:** `POST {{base_url}}{{api_prefix}}/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "testuser@example.com"
}
```

**Expected Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "testuser@example.com",
  "verified": false,
  "createdAt": "2026-02-04T05:20:00.000Z"
}
```

**Note:** Check server logs (terminal) for the OTP sent. In development, it's printed to console.

---

### Step 2: Verify OTP

**Endpoint:** `POST {{base_url}}{{api_prefix}}/auth/verify`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "testuser@example.com",
  "otp": "123456"
}
```

(Replace `123456` with the OTP from server logs)

**Expected Response (200):**
```json
{
  "success": true
}
```

Save the **user ID** from the registration response — you'll need it for wallet operations.

---

### Step 3: Fund Wallet

**Endpoint:** `POST {{base_url}}{{api_prefix}}/wallet/fund`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "currency": "NGN",
  "amount": 5000
}
```

**Expected Response (201):**
```json
{
  "id": "wallet-id-here",
  "currency": "NGN",
  "amount": "5000",
  "user": { "id": "550e8400-e29b-41d4-a716-446655440000" }
}
```

---

### Step 4: Get Wallet Balances

**Endpoint:** `GET {{base_url}}{{api_prefix}}/wallet`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Expected Response (200):**
```json
[
  {
    "currency": "NGN",
    "amount": "5000"
  }
]
```

---

### Step 5: Convert Currency (NGN → USD)

**Endpoint:** `POST {{base_url}}{{api_prefix}}/wallet/convert`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "from": "NGN",
  "to": "USD",
  "amount": 1000
}
```

**Expected Response (200):**
```json
{
  "from": {
    "id": "wallet-id-1",
    "currency": "NGN",
    "amount": "4000",
    "user": { "id": "550e8400-e29b-41d4-a716-446655440000" }
  },
  "to": {
    "id": "wallet-id-2",
    "currency": "USD",
    "amount": "6.5",
    "user": { "id": "550e8400-e29b-41d4-a716-446655440000" }
  },
  "rate": 0.0065,
  "received": 6.5
}
```

(Rate depends on live FX API response)

---

### Step 6: Convert EUR → NGN

**Endpoint:** `POST {{base_url}}{{api_prefix}}/wallet/convert`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "from": "EUR",
  "to": "NGN",
  "amount": 50
}
```

**First, fund EUR wallet:**

1. Call fund endpoint with `currency: "EUR"` and `amount: 50`
2. Then call convert as above

---

## 4. Quick Test Flow (Copy-Paste Ready)

1. **Register:**
   ```
   POST http://localhost:3000/api/auth/register
   { "email": "user@test.com" }
   ```
   → Copy the `id` returned

2. **Verify OTP:** (check server logs for OTP)
   ```
   POST http://localhost:3000/api/auth/verify
   { "email": "user@test.com", "otp": "123456" }
   ```

3. **Fund NGN:**
   ```
   POST http://localhost:3000/api/wallet/fund
   { "userId": "YOUR_USER_ID", "currency": "NGN", "amount": 5000 }
   ```

4. **Check Balance:**
   ```
   GET http://localhost:3000/api/wallet
   { "userId": "YOUR_USER_ID" }
   ```

5. **Convert to USD:**
   ```
   POST http://localhost:3000/api/wallet/convert
   { "userId": "YOUR_USER_ID", "from": "NGN", "to": "USD", "amount": 1000 }
   ```

---

## 5. Debugging Tips

| Issue | Solution |
|-------|----------|
| "Cannot find module" error | Run `npm install` |
| Server won't start | Check port 3000 is not in use, or set `PORT=3001` in `.env` |
| Redis error warnings | Normal if Redis not running; in-memory fallback is active |
| OTP not working | Check server logs for generated OTP; they're printed to console |
| Convert fails with "Insufficient balance" | Fund wallet first with larger amount |
| 404 on endpoints | Make sure server started and prefix is `/api` |

---

## 6. Import into Postman (Optional)

See `postman-collection.json` in the repo root to import pre-configured requests.

