import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import {
  buildSubscriptionCheckout,
  getPayFastConfig,
  postBackValidate,
  verifyItnSignature,
} from "./payments/payfast";
import {
  PRO_FIRST_CHARGE_ZAR,
  PRO_RECURRING_ZAR,
  TRIAL_DURATION_MS,
  BILLING_CYCLE_MS,
} from "@shared/pricing";

/**
 * Resolve the public base URL for return / cancel / notify URLs. Prefers
 * REPLIT_DEV_DOMAIN in dev and the request host in prod, falling back to
 * APP_BASE_URL if explicitly configured.
 */
function getBaseUrl(req: Request): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/+$/, "");
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol || "https";
  const host = req.get("host");
  return `${proto}://${host}`;
}

export function registerBillingRoutes(app: Express) {
  /**
   * Start (or refresh) the 72h Pro trial AND build a PayFast checkout URL.
   *
   * Strategy: with PayFast subscription_type=1, the `amount` is charged at
   * checkout. We charge the R99 first-month promo at checkout and schedule
   * the first R299 recurring charge 30 days later. The user is NOT granted
   * Pro access here — a `pending` subscription row is created purely to
   * provide a stable m_payment_id. Entitlement (trialing/active) only flips
   * when the ITN webhook from PayFast confirms a successful payment.
   */
  app.post("/api/billing/checkout/payfast", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.email) return res.status(400).json({ message: "User email required" });

      const sub = await storage.createPendingPayfastSubscription(userId);

      const cfg = getPayFastConfig(getBaseUrl(req));
      const now = new Date();
      const trialEnd = new Date(now.getTime() + TRIAL_DURATION_MS);
      // First R299 recurring charge: one full billing cycle after trial ends.
      const firstRecurringDate = new Date(trialEnd.getTime() + BILLING_CYCLE_MS);

      const { redirectUrl } = buildSubscriptionCheckout(cfg, {
        mPaymentId: sub.id,
        emailAddress: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        amount: PRO_FIRST_CHARGE_ZAR,
        recurringAmount: PRO_RECURRING_ZAR,
        billingDate: firstRecurringDate,
        itemName: "ArcSide Pro",
      });

      res.json({ redirectUrl, mode: cfg.mode });
    } catch (err) {
      console.error("[payfast] checkout failed:", err);
      res.status(500).json({ message: "Failed to start PayFast checkout" });
    }
  });

  /**
   * PayFast ITN webhook. POSTed as application/x-www-form-urlencoded.
   * Must be public (no auth) since the request comes from PayFast servers.
   *
   * Verification has 4 layers (per PayFast spec):
   *   1. Signature (md5 of params + passphrase) matches
   *   2. Server-to-server post-back to PayFast returns "VALID"
   *   3. Amount in the ITN matches what we expect (R99 init, R299 recurring)
   *   4. m_payment_id matches a known subscription row
   */
  app.post("/api/billing/webhooks/payfast", async (req: Request, res: Response) => {
    // Acknowledge fast — PayFast retries non-200 responses, so respond 200
    // even when we ignore the event, but only AFTER we've inspected & queued
    // the work. Errors during processing get logged but still 200 to break
    // retry storms (PayFast surfaces failures via dashboard).
    try {
      const body = req.body as Record<string, string>;
      const cfg = getPayFastConfig(getBaseUrl(req));

      const sigOk = verifyItnSignature(body, cfg.passphrase);
      if (!sigOk) {
        console.warn("[payfast] ITN signature mismatch", { m_payment_id: body.m_payment_id });
        return res.status(200).send("invalid signature");
      }

      const postBackOk = await postBackValidate(cfg, body);
      if (!postBackOk) {
        console.warn("[payfast] ITN post-back not VALID", { m_payment_id: body.m_payment_id });
        return res.status(200).send("post-back failed");
      }

      const mPaymentId = body.m_payment_id;
      const status = body.payment_status; // COMPLETE | FAILED | CANCELLED
      const pfSubscriptionId = body.token || body.pf_subscription_token;

      const sub = mPaymentId ? await storage.getSubscriptionById(mPaymentId) : undefined;
      if (!sub) {
        console.warn("[payfast] ITN for unknown m_payment_id:", mPaymentId);
        return res.status(200).send("unknown subscription");
      }

      const now = new Date();

      if (status === "COMPLETE") {
        // First successful charge → flip trial → active, lock in next billing.
        // billing_date in body is YYYY-MM-DD string per PayFast docs.
        const nextBillingDate = body.billing_date
          ? new Date(`${body.billing_date}T00:00:00+02:00`)
          : new Date(now.getTime() + BILLING_CYCLE_MS);

        await storage.updateSubscription(sub.id, {
          status: "active",
          tierLevel: 1,
          provider: "payfast",
          providerSubscriptionId: pfSubscriptionId ?? sub.providerSubscriptionId ?? null,
          currentPeriodStart: now,
          nextBillingDate,
          cancelAtPeriodEnd: false,
        });
        console.log("[payfast] subscription activated", { userId: sub.userId, sub: sub.id });
      } else if (status === "FAILED") {
        await storage.updateSubscription(sub.id, { status: "past_due" });
        console.log("[payfast] payment failed → past_due", { sub: sub.id });
      } else if (status === "CANCELLED") {
        await storage.updateSubscription(sub.id, { status: "canceled", cancelAtPeriodEnd: true });
        console.log("[payfast] subscription cancelled at PayFast", { sub: sub.id });
      } else {
        console.log("[payfast] ITN with status", status, "for", sub.id);
      }

      res.status(200).send("ok");
    } catch (err) {
      console.error("[payfast] ITN handler error:", err);
      res.status(200).send("error logged");
    }
  });
}
