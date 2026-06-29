import type { VercelRequest, VercelResponse } from "@vercel/node";

// Lazy load to handle cold starts gracefully
let honoApp: any;

async function getApp() {
  if (!honoApp) {
    const { default: app } = await import("./boot");
    honoApp = app;
  }
  return honoApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    
    // Build full URL
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "localhost";
    const url = `${protocol}://${host}${req.url}`;
    
    // Convert headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, String(value));
      }
    }
    
    // Build request body
    let body: string | undefined;
    if (req.body && req.method !== "GET" && req.method !== "HEAD") {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    }
    
    // Create fetch Request
    const fetchReq = new Request(url, {
      method: req.method,
      headers,
      body,
    });
    
    // Process with Hono
    const fetchRes = await app.fetch(fetchReq);
    
    // Send response
    res.status(fetchRes.status);
    fetchRes.headers.forEach((value: string, key: string) => {
      // Skip headers that cause issues
      if (["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) return;
      try {
        res.setHeader(key, value);
      } catch (_) { /* ignore */ }
    });
    
    const text = await fetchRes.text();
    res.send(text);
    
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Internal Server Error", detail: String(err) });
  }
}

export const config = {
  maxDuration: 30,
};
