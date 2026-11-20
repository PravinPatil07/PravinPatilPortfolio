export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

const FROM = "Portfolio Contact <onboarding@resend.dev>";

async function send(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email service error (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

function esc(value: string) {
  return value.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c);
}

export async function sendContactEmails(payload: ContactPayload, ownerEmail: string) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY missing — message logged but not emailed", {
      from: payload.email,
      subject: payload.subject,
    });
    return { ok: true as const, delivered: false as const };
  }


  const shell = (title: string, inner: string) => `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;background:#0d1117;padding:28px">
      <div style="max-width:560px;margin:0 auto;background:#151b26;border:1px solid #263041;border-radius:16px;padding:28px;color:#e8eef6">
        <h1 style="margin:0 0 16px;font-size:18px;color:#7de2f5">${title}</h1>
        ${inner}
      </div>
    </div>`;

  await send(apiKey, {
    from: FROM,
    to: [ownerEmail],
    reply_to: payload.email,
    subject: `Portfolio enquiry: ${payload.subject}`,
    html: shell(
      "New message from your portfolio",
      `<p><strong>Name:</strong> ${esc(payload.name)}</p>
       <p><strong>Email:</strong> ${esc(payload.email)}</p>
       ${payload.phone ? `<p><strong>Phone:</strong> ${esc(payload.phone)}</p>` : ""}
       <p><strong>Subject:</strong> ${esc(payload.subject)}</p>
       <p style="white-space:pre-wrap;border-top:1px solid #263041;padding-top:14px">${esc(payload.message)}</p>`,
    ),
  });

  try {
    await send(apiKey, {
      from: FROM,
      to: [payload.email],
      subject: "Thanks for reaching out — Pravin Patil",
      html: shell(
        `Thanks, ${esc(payload.name.split(" ")[0] ?? payload.name)}!`,
        `<p style="color:#a8b4c4">Your message reached me and I'll reply as soon as I can.</p>
       <p style="color:#a8b4c4"><strong>Subject:</strong> ${esc(payload.subject)}</p>
       <p style="white-space:pre-wrap;color:#a8b4c4;border-top:1px solid #263041;padding-top:14px">${esc(payload.message)}</p>
       <p style="color:#7de2f5;margin-top:20px">— Pravin Patil · AI / ML Engineer</p>`,
      ),
    });
  } catch (err) {
    // Sender domain not verified yet: visitor auto-reply is optional, owner notification already sent.
    console.warn("[contact] confirmation email skipped", err);
  }


  return { ok: true as const, delivered: true as const };
}
