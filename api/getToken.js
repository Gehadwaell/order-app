export default async function handler(req, res) {
  try {
    const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, D365_URL } = process.env;
    const resource = D365_URL.replace(/\/$/, "");
    const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`;

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("resource", resource);
    params.append("grant_type", "client_credentials");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}