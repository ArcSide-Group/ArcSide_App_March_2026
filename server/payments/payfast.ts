import crypto from "crypto";

/**
 * PayFast adapter — modular wrapper around the PayFast Subscriptions
 * (Recurring Billing) API. Designed so swapping `PAYFAST_MERCHANT_ID`,
 * `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE` and `PAYFAST_MODE` from
 * sandbox to live is the only change needed for production.
 *
 * Reference: https://developers.payfast.co.za/docs#recurring_billing
 */

export type PayFastMode = "sandbox" | "live";

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: PayFastMode;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export function getPayFastConfig(baseUrl: string): PayFastConfig {
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID || "10000100",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
    // PayFast sandbox default passphrase. PayFast's signature spec REQUIRES
    // the passphrase to be appended even in sandbox; using an empty string
    // produces a "400 Bad Request" on the process.payfast.co.za page.
    passphrase: process.env.PAYFAST_PASSPHRASE || "payfast",
    mode: (process.env.PAYFAST_MODE as PayFastMode) || "sandbox",
    returnUrl: `${baseUrl}/subscription?pf=success`,
    cancelUrl: `${baseUrl}/subscription?pf=cancel`,
    notifyUrl: `${baseUrl}/api/billing/webhooks/payfast`,
  };
}

export function getProcessUrl(mode: PayFastMode): string {
  return mode === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

export function getValidateUrl(mode: PayFastMode): string {
  return mode === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";
}

/**
 * PayFast requires URL-encoding per RFC 1738: spaces become `+`, hex chars
 * uppercase. Node's encodeURIComponent uses lowercase hex and `%20`, so we
 * post-process.
 */
function pfEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

/**
 * Build the MD5 signature PayFast requires. Critical: parameters MUST appear
 * in the same order they are submitted in the form. The passphrase, if set,
 * is appended last (also URL-encoded).
 */
export function signParams(
  params: Record<string, string>,
  passphrase: string,
): string {
  const segments: string[] = [];
  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null || raw === "") continue;
    if (key === "signature") continue;
    segments.push(`${key}=${pfEncode(String(raw).trim())}`);
  }
  let signatureString = segments.join("&");
  if (passphrase && passphrase.trim().length > 0) {
    signatureString += `&passphrase=${pfEncode(passphrase.trim())}`;
  }
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

export interface CheckoutOpts {
  /** Our internal subscription / payment id — surfaces back in the ITN. */
  mPaymentId: string;
  /** Logged-in user's email (PayFast pre-fills this on the checkout page). */
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  /** Initial amount to charge at checkout (e.g. 99.00 for promo first month). */
  amount: number;
  /** Recurring monthly amount (e.g. 299.00). */
  recurringAmount: number;
  /** Date of the first recurring charge (after the initial `amount`). */
  billingDate: Date;
  /** Plain-language label shown on the PayFast page + on the user's statement. */
  itemName: string;
  itemDescription?: string;
}

// PayFast subscription field order. `item_description` is intentionally
// omitted: including it has been observed to break sandbox signature
// validation (400 Bad Request on the process page) when the description
// contains characters PayFast normalises differently from our pfEncode.
const PARAM_ORDER: string[] = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "m_payment_id",
  "amount",
  "item_name",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
];

function fmtAmount(value: number): string {
  return value.toFixed(2);
}

function fmtBillingDate(d: Date): string {
  // PayFast wants YYYY-MM-DD in SAST. Build manually to avoid TZ surprises.
  const sast = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  const y = sast.getUTCFullYear();
  const m = String(sast.getUTCMonth() + 1).padStart(2, "0");
  const day = String(sast.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build the GET-parameter set + signed redirect URL for the PayFast checkout.
 * The frontend simply navigates `window.location = result.redirectUrl`.
 */
export function buildSubscriptionCheckout(
  cfg: PayFastConfig,
  opts: CheckoutOpts,
): { redirectUrl: string; params: Record<string, string> } {
  const raw: Record<string, string> = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: cfg.returnUrl,
    cancel_url: cfg.cancelUrl,
    notify_url: cfg.notifyUrl,
    name_first: opts.firstName ?? "",
    name_last: opts.lastName ?? "",
    email_address: opts.emailAddress,
    m_payment_id: opts.mPaymentId,
    amount: fmtAmount(opts.amount),
    item_name: opts.itemName,
    subscription_type: "1", // 1 = Subscription, 2 = Tokenization
    billing_date: fmtBillingDate(opts.billingDate),
    recurring_amount: fmtAmount(opts.recurringAmount),
    frequency: "3", // 3 = monthly
    cycles: "0", // 0 = bill until cancelled
  };

  // Re-key in canonical order so signature matches form post order.
  const ordered: Record<string, string> = {};
  for (const k of PARAM_ORDER) {
    if (raw[k] !== undefined && raw[k] !== "") ordered[k] = raw[k];
  }

  const signature = signParams(ordered, cfg.passphrase);
  const finalParams = { ...ordered, signature };

  const qs = Object.entries(finalParams)
    .map(([k, v]) => `${k}=${pfEncode(v)}`)
    .join("&");

  return { redirectUrl: `${getProcessUrl(cfg.mode)}?${qs}`, params: finalParams };
}

/**
 * ITN signature verification: PayFast posts every parameter back, including
 * `signature`. Re-sign the rest in the order received and compare.
 */
export function verifyItnSignature(
  body: Record<string, string>,
  passphrase: string,
): boolean {
  const received = (body.signature || "").toLowerCase();
  if (!received) return false;
  const expected = signParams(body, passphrase).toLowerCase();
  return crypto.timingSafeEqual(
    Buffer.from(received, "utf8"),
    Buffer.from(expected, "utf8"),
  );
}

/**
 * Server-to-server post-back: ask PayFast whether the ITN we received is
 * actually one they sent. Required by the PayFast spec to defend against
 * spoofed callbacks.
 */
export async function postBackValidate(
  cfg: PayFastConfig,
  body: Record<string, string>,
): Promise<boolean> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  try {
    const res = await fetch(getValidateUrl(cfg.mode), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const text = (await res.text()).trim();
    return text === "VALID";
  } catch (err) {
    console.error("[payfast] post-back validate failed:", err);
    return false;
  }
}
