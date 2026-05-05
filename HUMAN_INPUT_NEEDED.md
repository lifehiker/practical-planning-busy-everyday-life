# Human Input Needed

Before deploying ShiftMeal to production, you need to set up the following services and provide credentials.

## 1. PostgreSQL Database

Set up a PostgreSQL 16 database and add the connection string:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME
```

Run migrations after the database is ready:
```bash
npx prisma migrate deploy
```

## 2. NextAuth Secret

Generate a random secret for NextAuth session signing:

```bash
openssl rand -base64 32
```

Add the output as:
```
AUTH_SECRET=<generated-secret>
```

## 3. Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable the Google Identity API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Add Authorized redirect URIs: `https://YOUR_DOMAIN/api/auth/callback/google`
7. Copy the Client ID and Secret:

```
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
```

## 4. Resend (Email)

1. Sign up at https://resend.com
2. Verify your domain (shiftmeal.app or your custom domain)
3. Create an API key
4. Update the `from` address in `src/lib/resend.ts` and `src/auth.ts` to match your verified domain

```
RESEND_API_KEY=re_<your-api-key>
```

## 5. Stripe (Payments)

1. Sign up at https://stripe.com
2. Create two products in the Stripe dashboard:
   - **Pro Household (Monthly)**: $8.99/month recurring
   - **Pro Household (Annual)**: $69/year recurring
3. Copy the Price IDs for each product

```
STRIPE_SECRET_KEY=sk_live_<your-secret-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-publishable-key>
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_<monthly-price-id>
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_<yearly-price-id>
```

4. Set up a Stripe webhook:
   - Endpoint URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret as `STRIPE_WEBHOOK_SECRET`

## 6. App URL

```
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
```

## 7. Environment File Summary

Copy `.env.example` to `.env` (or set in Coolify) and fill in all values:

```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=
NEXT_PUBLIC_APP_URL=
```

## 8. Domain Setup

Update the hardcoded domain references if you're not using `shiftmeal.app`:

- `src/lib/resend.ts`: Update the `from` email address
- `src/auth.ts`: Update the `from` email address in ResendProvider
- `src/app/layout.tsx`: Update the OpenGraph URL
