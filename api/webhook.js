export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward to n8n webhook
    const response = await fetch('https://n8n.srv1137065.hstgr.cloud/webhook/a8d8e344-8947-482c-afcf-c77825e79095', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to send to webhook' });
  }
}
