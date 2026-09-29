# Toolnest accounts and WhatsApp setup

The website now supports registration, mobile number + password login, customer-owned rentals, staff-confirmed pickup/return, and a persistent WhatsApp outbox. Live services stay disabled until configured. A separate, explicitly selected presentation mode runs in the browser and never sends a message.

## 1. Connect the database

In the existing **toolnest-rentals** Vercel project, open **Storage → Create Database → Upstash Redis** and choose an appropriate plan. Connect the database to the project's Production environment. Creating a cloud resource requires the account owner's approval. This database contains accounts and rentals: enable persistence, disable eviction, and do not treat it as a disposable cache.

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel Environment Variables. Depending on the integration's chosen prefix, you may need to map its values to these exact names. Do not expose them with `NEXT_PUBLIC_`.

Set `TOOLNEST_STAFF_PASSWORD` and `CRON_SECRET` to different random secrets, at least 32 characters each. Set `LATE_FEE_PER_DAY=50`, or change it to the intended rate. Each booking stores its own fee rate so later setting changes do not change old agreements.

Registration saves a salted scrypt password hash. Login requires an existing registration and creates a random, server-stored session in an HttpOnly cookie. No live password or session is stored in browser storage. The current mobile/password flow does not verify ownership of the entered phone number with an OTP; verify your own test recipient in Meta before using it for the college demonstration. Public rollout should add phone verification before accepting third-party notification recipients.

## 2. Create the Meta WhatsApp app

1. Open https://developers.facebook.com/apps/ and create an app for your business with WhatsApp enabled.
2. In WhatsApp **API Setup**, use Meta's test business number first. Add your own WhatsApp number as a test recipient and complete Meta's verification.
3. Copy the **Phone number ID** (not the phone number or WhatsApp Business Account ID) into `WHATSAPP_PHONE_NUMBER_ID`.
4. Set `WHATSAPP_ACCESS_TOKEN` to the access token. Temporary test tokens expire; ongoing operation needs an appropriately scoped system-user token with `whatsapp_business_messaging` permission.
5. Set `WHATSAPP_API_VERSION` to the version shown by the app's current API example, including `v` (for example `v24.0` if offered). The code deliberately requires an explicit version.
6. Add the app secret as `WHATSAPP_APP_SECRET`. Generate another random string for `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.

Keep all secrets in Vercel's Environment Variables. Do not paste them into a chat, commit them to GitHub, or put them in frontend code. Meta account identity, business details, phone verification, billing and applicable service charges must be handled by the account owner.

## 3. Create and approve templates

In WhatsApp Manager, create the following **Utility** templates using positional body parameters and the language **English (US)** (`en_US`). No header, footer, buttons or media are required. If you choose another language, set `WHATSAPP_TEMPLATE_LANGUAGE` to its exact code. Wait for approval before enabling live sending. Template availability for a test WABA depends on Meta's current setup; if custom templates cannot be approved there, complete business onboarding before testing this complete flow. The built-in `hello_world` test alone does not validate these four notifications.

### `toolnest_order_confirmed`

```text
Hi {{1}}, your ToolNest order {{2}} has been confirmed!
Tool: {{3}}
Pickup: {{4}}, {{5}} IST
Location: {{6}}, {{7}}
Return by: {{8}}
Late return fee: INR {{9}} per started 24 hours after the deadline.
Bring a valid photo ID when you collect the tool.
```

Parameters: customer name; booking ID; tool; pickup date; pickup slot; shop name; address; return deadline; daily late fee.

### `toolnest_pickup_confirmed`

```text
Hi {{1}}, pickup for ToolNest booking {{2}} is confirmed.
You collected {{3}} from {{4}}.
Return by: {{5}}
Late return fee: INR {{6}} per started 24 hours after the deadline.
Thank you for renting with ToolNest.
```

### `toolnest_return_reminder`

```text
Hi {{1}}, this is a return reminder for ToolNest booking {{2}}.
Please return {{3}} to {{4}} by {{5}}.
Late return fee: INR {{6}} per started 24 hours after the deadline.
Please return your tool on time.
```

The pickup and reminder parameter order is: customer name; booking ID; tool; shop; return deadline; fee.

### `toolnest_overdue_notice`

```text
Hi {{1}}, ToolNest booking {{2}} is overdue.
Tool: {{3}}
Return deadline: {{4}}
Late period: {{5}} day(s)
Current fine: INR {{6}}
Rate: INR {{7}} per started 24 hours.
Please return your tool to {{8}}. The fine increases until the return is confirmed.
```

Parameters: customer name; booking ID; tool; return deadline; late days; current fine; fee rate; shop.

The rendered message history is a readable preview of the same booking information. The exact WhatsApp layout is controlled by the approved templates above.

## 4. Connect delivery receipts

Redeploy the existing Vercel project after saving environment variables. In Meta, configure:

- Callback URL: `https://toolnest-rentals.vercel.app/api/whatsapp/webhook`
- Verify token: the value of `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Subscribe to the **messages** webhook field.

Webhook POSTs require the Meta HMAC signature using the app secret. The UI distinguishes queued, accepted, sent, delivered, read, failed and unconfirmed states. An accepted send request is not represented as delivered. Uncertain network results are not automatically resent, preventing blind duplicate notifications; check WhatsApp Manager when a message is marked unconfirmed.

Finally set `WHATSAPP_ENABLED=true` and redeploy. This setting means the integration is configured; actual delivery is only verified by a successful phone test and a signed delivery receipt.

## 5. Test the live flow with your own verified number

1. Open the site in live mode. Register with your name, Indian mobile number and a new password. Opt in to WhatsApp rental notifications.
2. Registration must take you to login. Log in using that mobile number and password.
3. Choose a tool, shop, available dates and a future pickup time; confirm once. Verify the order message on your phone.
4. Open `/manage` in a separate browser/private window and log in using the staff password. When the pickup slot begins, confirm the actual pickup. Verify the pickup message and return deadline.
5. The daily check sends a return reminder within the final 24 hours before the 6 PM IST deadline. Same-day pickups within this window trigger an immediate reminder after the pickup confirmation.
6. Overdue notices are generated for active rentals after the deadline. The fee is `ceil((now - dueAt) / 24 hours) × saved daily fee`. A completed return freezes the final fine and stops future reminders/notices. Uncollected reservations do not accrue late fees.
7. Confirm the return in the staff screen. Verify that later checks do not generate new reminder or overdue messages.

The public catalogue remains the owner's college demonstration catalogue, with indicative prices, sample locations and sample availability. These are not verified real supplier reservations or payment processing.

## Scheduling and operations

`vercel.json` schedules `/api/cron/notifications` daily at 03:30 UTC (09:00 IST). `CRON_SECRET` authenticates the request. On Vercel Hobby, a daily job may run within the scheduled hour, so this is a daily notification system, not a minute-accurate alarm. The staff **Check due notifications** button processes due messages immediately. For more frequent automated checks, use an appropriate Vercel plan or an external scheduler authenticated with the same secret. Do not expose that secret publicly.

The queue persists in Redis, deduplicates each event, reserves dates atomically across customers, and checks current rental status before sending. Each run processes at most 30 due messages within its time budget; for a larger public service, increase the scheduler frequency and add monitoring. Cancelled or returned bookings suppress stale queued messages. A 429 response is retried up to three attempts; failed or uncertain sends stay visible for investigation. Changing a phone number, password recovery, and OTP verification are outside this first registration flow.

## Presentation without live services

On the registration screen select **Try presentation demo**. Use a demo password. Register, then log in; book a tool and open its details. Use **Simulate pickup → Preview due reminder → Simulate 1 day overdue → Confirm demo return**. Each extra overdue day adds the saved rate. All messages explicitly say **Preview only — not sent**. Demo accounts/bookings stay only in that browser and are never converted into live accounts or queued for real WhatsApp delivery.

## Verification and official references

Local automated checks cover the UI, account isolation, server authorization, atomic reservations, notification scheduling, fee calculation, signed delivery receipts and the Meta request payload using a local Redis-compatible test service and a mock Meta transport. These tests do not prove that a particular Meta account or template is approved, or that a message reaches a phone.

- https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- https://www.postman.com/meta/whatsapp-business-platform/overview
- https://upstash.com/docs/redis/features/restapi
- https://vercel.com/docs/cron-jobs/usage-and-pricing
