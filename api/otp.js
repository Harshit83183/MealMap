import supabase from './db-client.js';

const otpStore = new Map(); // In-memory demo store (in production use Redis or SMS service)

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { action, phone, otp } = req.body;
      if (action === 'send') {
        if (!phone || phone.length < 10) return res.status(400).json({ error: 'Valid phone number required' });
        const generatedOTP = generateOTP();
        otpStore.set(phone, { otp: generatedOTP, expires: Date.now() + 5 * 60 * 1000 });
        console.log(`[DEMO OTP] Phone: ${phone}, OTP: ${generatedOTP}`);
        return res.status(200).json({ message: 'OTP sent successfully', demo: true, otp: generatedOTP });
      }
      if (action === 'verify') {
        if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
        const record = otpStore.get(phone);
        if (!record) return res.status(400).json({ error: 'OTP expired or not found' });
        if (Date.now() > record.expires) {
          otpStore.delete(phone);
          return res.status(400).json({ error: 'OTP expired' });
        }
        if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
        otpStore.delete(phone);
        return res.status(200).json({ verified: true });
      }
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
