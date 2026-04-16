export default async function handler(req, res) {
  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, D365_URL } = process.env;

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !D365_URL) {
    return res.status(500).json({ error: "Server misconfiguration: missing environment variables" });
  }

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Step 1: Get D365 token ---
  const resource = D365_URL.replace(/\/$/, "");
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`;

  let accessToken;
  try {
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        resource,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Token fetch failed:", err);
      return res.status(502).json({ error: "Failed to get D365 token", details: err });
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
  } catch (err) {
    return res.status(500).json({ error: "Token request error", details: err.message });
  }

  // --- Step 2: Build target URL ---
  const routePath = req.query.route || "";
  let targetUrl = `${resource}/${routePath}`;

  const urlParts = req.url.split("?");
  if (urlParts.length > 1) {
    const rawQueryString = urlParts[1];
    const cleanQueryString = rawQueryString
      .replace(/(?:^|&)route=[^&]*/g, "")
      .replace(/^&/, "");

    if (cleanQueryString) {
      targetUrl += `?${cleanQueryString}`;
    }
  }

  // --- Step 3: Forward to D365 ---
  const forwardHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
  };

  if (req.headers["if-match"]) {
    forwardHeaders["If-Match"] = req.headers["if-match"];
  }

  let d365Res;
  try {
    d365Res = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body:
        ["POST", "PUT", "PATCH"].includes(req.method) && req.body && Object.keys(req.body).length > 0
          ? JSON.stringify(req.body)
          : undefined,
    });
  } catch (err) {
    return res.status(502).json({ error: "D365 request failed", details: err.message });
  }

  // --- Step 4: Return response ---
  const responseText = await d365Res.text();
  res.status(d365Res.status);
  res.setHeader("Content-Type", d365Res.headers.get("content-type") || "application/json");
  res.send(responseText);
}