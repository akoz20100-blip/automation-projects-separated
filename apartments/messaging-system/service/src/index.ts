/** App bootstrap: mounts routes, auth, and error handling. */

import "dotenv/config";
import express, { type Request } from "express";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { intakeRouter } from "./routes/intake.js";
import { reservationsRouter } from "./routes/reservations.js";
import { messagesRouter } from "./routes/messages.js";
import { landingRouter } from "./routes/landing.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { cronRouter } from "./routes/cron.js";
import { telegramRouter } from "./routes/telegram.js";

export function createApp() {
  const app = express();

  // Capture the raw body (needed for WhatsApp webhook signature verification).
  app.use(
    express.json({
      limit: "12mb",
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  app.get("/health", (_req, res) => res.json({ ok: true, mode: env.whatsappMode }));

  // Public (no bearer auth): landing page + Meta webhook.
  app.use("/api/landing", landingRouter);
  app.use("/api/webhooks", webhooksRouter);
  // Scheduled jobs — guarded internally by CRON_SECRET (Vercel Cron / external).
  app.use("/api/cron", cronRouter);
  // Telegram intake bot — guarded internally by the webhook secret token.
  app.use("/api/telegram", telegramRouter);

  // Authenticated API.
  app.use("/api/intake", requireAuth, intakeRouter);
  app.use("/api/reservations", requireAuth, reservationsRouter);
  app.use("/api/messages", requireAuth, messagesRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

// Only listen when run directly (not when imported by tests or serverless).
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`apartment-guest-messaging service listening on :${env.port} (mode=${env.whatsappMode})`);
  });
}

export default createApp;
