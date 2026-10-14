const TYPES = ["Music video", "Aerial visuals", "Other film project"];
const clean = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function handleRequest(request, env, sendEmail) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/inquiry") return new Response("Not found", { status: 404 });
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!body || typeof body !== "object") return new Response("Bad request", { status: 400 });

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const type = TYPES.includes(body.type) ? body.type : "Other film project";
  const details = String(body.details ?? "").trim().slice(0, 5000);
  if (!name || !details || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return new Response("Invalid input", { status: 400 });
  }

  try {
    await sendEmail({
      from: env.FROM_EMAIL,
      to: env.TO_EMAIL,
      replyTo: email,
      subject: `RYU Films inquiry: ${type} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nProject: ${type}\n\n${details}`,
    });
  } catch (err) {
    console.error("send failed", err);
    return new Response("Send failed", { status: 502 });
  }
  return new Response("OK");
}
