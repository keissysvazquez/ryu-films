import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const TO = "raulduplessi@yahoo.com";
const FROM = "inquiries@ryufilms.com";
const TYPES = ["Music video", "Aerial visuals", "Other film project"];
const clean = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/inquiry") return new Response("Not found", { status: 404 });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const name = clean(body.name, 100);
    const email = clean(body.email, 200);
    const type = TYPES.includes(body.type) ? body.type : "Other film project";
    const details = String(body.details ?? "").trim().slice(0, 5000);
    if (!name || !details || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
      return new Response("Invalid input", { status: 400 });
    }

    const msg = createMimeMessage();
    msg.setSender({ name: "RYU Films Website", addr: FROM });
    msg.setRecipient(TO);
    msg.setSubject(`RYU Films inquiry: ${type} from ${name}`);
    msg.setHeader("Reply-To", email);
    msg.addMessage({
      contentType: "text/plain",
      data: `Name: ${name}\nEmail: ${email}\nProject: ${type}\n\n${details}`,
    });

    try {
      await env.EMAIL.send(new EmailMessage(FROM, TO, msg.asRaw()));
    } catch (err) {
      console.error("send failed", err);
      return new Response("Send failed", { status: 502 });
    }
    return new Response("OK");
  },
};
