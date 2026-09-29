# Toolnest Rentals

A college tool-rental project built with Next.js, React and TypeScript, deployed on Vercel.

## Customer journey

1. Register with a full name, Indian mobile number and password.
2. Log in using the registered mobile number and password.
3. Browse tools and pickup locations, choose available dates and a pickup slot.
4. Confirm a booking and receive an order confirmation on WhatsApp after the live integration is connected.
5. Staff confirm pickup and return from `/manage`. Customers can track deadlines, reminders, late fees and message delivery in their booking details.

Returns are due by **6 PM India time**. The default late fee is **₹50 per started 24-hour period**, saved when each booking is made. A completed return freezes the fine and stops future reminders. Catalogue prices, suppliers and sample availability remain indicative demonstration data; no payments are collected.

## Local development

Use Node.js 22.13+ and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

For live accounts, copy `.env.example` to `.env.local` and connect the services described below. Without service credentials, the site offers an explicitly selected **presentation demo**. Demo data stays in that browser and no WhatsApp messages are sent.

```sh
pnpm exec tsc --noEmit
pnpm build
```

## Activate live accounts and WhatsApp

Read [docs/WHATSAPP_SETUP.md](docs/WHATSAPP_SETUP.md) for Upstash Redis, Meta WhatsApp Business templates, Vercel secrets, webhook setup, scheduled reminders, and a real-phone verification checklist. An on-site walkthrough is available at `/setup`.

The daily scheduler runs around 9 AM India time and requires `CRON_SECRET`. The staff screen can also process due notifications immediately. Secrets belong in Vercel Environment Variables, never in browser code or GitHub.

## Project structure

- `app/page.tsx`: existing catalogue, rental calendar and customer dashboard.
- `components/account-form.tsx`: registration and mobile login.
- `components/rental-messages.tsx`: WhatsApp history and presentation controls.
- `app/manage/page.tsx`: protected staff pickup/return screen.
- `lib/catalog.ts`: original tool, tariff and shop data.
- `lib/rental.ts`: shared date, fine and message rules.
- `lib/server/`: persistent storage, authentication and Meta integration.
- `app/api/`: authenticated account, booking, staff, scheduler and signed webhook routes.

The earlier Sites/Cloudflare starter files are retained for source history; the current `dev`, `build` and `start` commands use Next.js, and the existing Vercel project is the deployment target.

## Tests

`tests/live-flow.mjs` checks the HTTP account/rental/notification flow against local Redis-compatible and Meta test doubles. `tests/browser-flow.mjs` checks registration, login, booking, pickup, reminder, overdue fines, return, reload and mobile layouts. Neither sends a real WhatsApp message.

Install Python test requirements and make Playwright with Chromium available in your local test environment, then run:

```sh
python -m pip install -r tests/requirements.txt
bash tests/run-local.sh
```

Browser captures and logs are written to the ignored `.sites-runtime/test-output/` directory. Successful local tests still require a separate live phone test after the owner connects Meta and approves the templates.
