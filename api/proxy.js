const https = require("https");
const querystring = require("querystring");

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const body = querystring.stringify({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: process.env.D365_SCOPE,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "login.microsoftonline.com",
        path: `/${process.env.TENANT_ID}/oauth2/v2.0/token`,
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
              resolve(cachedToken);
            } else {
              reject(new Error(parsed.error_description || "Token failed"));
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const token = await getToken();

    // Reconstruct the full D365 URL
    // req.query.d365path = "data/SalesOrderHeadersV3"
    // Other query params stay in req.query too
    const d365path = req.query.d365path || "";
    
    // Rebuild query string without our custom param
    const queryParams = { ...req.query };
    delete queryParams.d365path;
    const qs = new URLSearchParams(queryParams).toString();
    
    const targetUrl = `${process.env.D365_BASE_URL}/${d365path}${qs ? "?" + qs : ""}`;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "OData-MaxPageSize": "200",
      Prefer: "return=minimal",
    };

    const fetchOptions = { method: req.method, headers };

    if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(`→ ${req.method} ${targetUrl}`);

    const d365Res = await fetch(targetUrl, fetchOptions);
    const contentType = d365Res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await d365Res.json();
      return res.status(d365Res.status).json(data);
    } else {
      const text = await d365Res.text();
      return res.status(d365Res.status).send(text);
    }
  } catch (err) {
    console.error("Proxy error:", err.message);
    return res.status(500).json({ error: "Proxy error", details: err.message });
  }
}