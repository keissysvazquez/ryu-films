import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import { handleRequest } from "./handler.js";

export default {
  fetch(request, env) {
    return handleRequest(request, env, async ({ from, to, replyTo, subject, text }) => {
      const msg = createMimeMessage();
      msg.setSender({ name: "RYU Films Website", addr: from });
      msg.setRecipient(to);
      msg.setSubject(subject);
      msg.addMessage({ contentType: "text/plain", data: text });
      await env.EMAIL.send(new EmailMessage(from, to, `Reply-To: <${replyTo}>\r\n${msg.asRaw()}`));
    });
  },
};
