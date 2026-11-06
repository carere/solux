import handler, { createServerEntry } from "@tanstack/solid-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server";

export default createServerEntry({
  fetch(request) {
    // Paraglide's AsyncLocalStorage keeps concurrent cookie locales isolated.
    return paraglideMiddleware(request, async ({ request, locale }) => {
      const response = await handler.fetch(request);
      const headers = new Headers(response.headers);
      headers.set("Content-Language", locale);
      // HTML and Start data responses are personalized by the locale cookie.
      headers.set("Cache-Control", "private, no-store");
      const vary = headers.get("Vary");
      headers.set("Vary", vary ? `${vary}, Cookie` : "Cookie");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    });
  },
});
