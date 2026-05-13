import nodemailer from "nodemailer";

const FROM = "info@arcside.co.za";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[MAIL] SMTP_HOST / SMTP_USER / SMTP_PASS not configured — emails will not be sent");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<void> {
  const transport = createTransport();
  if (!transport) return;

  try {
    const info = await transport.sendMail({
      from: FROM,
      to: options.to,
      subject: options.subject,
      ...(options.html ? { html: options.html } : { text: options.text ?? "" }),
    });
    console.log(`[MAIL] Sent — messageId: ${info.messageId}`);
  } catch (err) {
    console.error("[MAIL] Send failed:", err);
    throw err;
  }
}

export async function verifyMailTransport(): Promise<boolean> {
  const transport = createTransport();
  if (!transport) return false;
  try {
    await transport.verify();
    console.log("[MAIL] SMTP connection verified — ready to send");
    return true;
  } catch (err) {
    console.error("[MAIL] SMTP verification failed:", err);
    return false;
  }
}
