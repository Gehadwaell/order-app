import https from "node:https";
import { URLSearchParams } from "node:url";

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get a bearer token from Microsoft Entra ID (Azure AD).
 * Caches and auto-refreshes 5 min before expiry.
 */
export async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300_000) {
    return cachedToken;
  }

  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, D365_SCOPE } = process.env;

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !D365_SCOPE) {
    throw new Error("Missing .env variables — check TENANT_ID, CLIENT_ID, CLIENT_SECRET, D365_SCOPE");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: D365_SCOPE,
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "login.microsoftonline.com",
        path: `/${TENANT_ID}/oauth2/v2.0/token`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.access_token) {
              cachedToken = parsed.access_token;
              tokenExpiry = Date.now() + parsed.expires_in * 1000;
              console.log("✔ Token acquired, expires in", parsed.expires_in, "s");
              resolve(cachedToken);
            } else {
              reject(new Error(parsed.error_description || "Token request failed"));
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
