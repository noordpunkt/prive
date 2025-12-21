# Stripe Webhook Setup for Vercel

## Webhook URL

Your Stripe webhook endpoint URL is:
```
https://prive-eight.vercel.app/api/webhooks/stripe
```

## Setup Steps

### 1. Configure Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your endpoint URL: `https://prive-eight.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)

### 2. Add Environment Variables in Vercel

1. Go to: https://vercel.com/andres-buzzios-projects/prive/settings/environment-variables
2. Add these variables:

   **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Value: `pk_test_...` (Get from Stripe Dashboard → Developers → API keys)
   - Environment: Production, Preview, Development

   **STRIPE_SECRET_KEY**
   - Value: `sk_test_...` (Get from Stripe Dashboard → Developers → API keys)
   - Environment: Production, Preview, Development

   **STRIPE_WEBHOOK_SECRET**
   - Value: `whsec_...` (from step 1)
   - Environment: Production, Preview, Development

3. Click **"Save"**

### 3. Redeploy

1. Go to: https://vercel.com/andres-buzzios-projects/prive/deployments
2. Click the three dots (⋯) on the latest deployment
3. Select **"Redeploy"**
4. Wait for deployment to complete

## Testing

After setup, test a payment:
1. Use test card: `4242 4242 4242 4242`
2. Complete a payment
3. Check Stripe Dashboard → Webhooks → Your endpoint → "Recent events"
4. You should see `payment_intent.succeeded` events

## Troubleshooting

- **Webhook not receiving events?**
  - Check that the webhook URL is correct
  - Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
  - Check webhook logs in Stripe Dashboard

- **Payment succeeds but booking not updated?**
  - Check Vercel function logs: https://vercel.com/andres-buzzios-projects/prive/logs
  - Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
  - Check webhook event details in Stripe Dashboard

