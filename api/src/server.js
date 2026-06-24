require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'doket-api', timestamp: new Date().toISOString() });
});

// M-Pesa STK Push — placeholder
app.post('/api/mpesa/stk-push', async (req, res) => {
  const { phone, amount, invoiceId } = req.body;
  if (!phone || !amount || !invoiceId) {
    return res.status(400).json({ error: 'phone, amount, invoiceId are required' });
  }
  // TODO: integrate Safaricom Daraja API
  res.json({ success: true, message: 'STK push initiated (placeholder)', checkoutRequestId: 'placeholder' });
});

// M-Pesa callback — Safaricom posts payment confirmation here
app.post('/api/mpesa/callback', (req, res) => {
  const { Body } = req.body;
  console.log('M-Pesa callback:', JSON.stringify(Body, null, 2));
  // TODO: update invoice status in Supabase
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

app.listen(PORT, () => {
  console.log(`Doket API running on port ${PORT}`);
});
