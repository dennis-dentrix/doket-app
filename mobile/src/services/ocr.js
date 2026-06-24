/**
 * OCR service — extracts vendor, amount, date from a receipt image URI.
 *
 * To wire up a real provider, replace the body of `extractReceiptData` with
 * a call to Google Cloud Vision, AWS Textract, or any REST OCR endpoint.
 * The function must return { vendor, amount, date } (all optional strings).
 */

export async function extractReceiptData(imageUri) {
  // Stub — returns empty fields after a short delay so the UI shows the
  // "Scanning…" state before handing back control.
  await new Promise(r => setTimeout(r, 1800));
  return { vendor: '', amount: '', date: '' };

  /*
  // ── Google Cloud Vision example (replace above with this) ──────────────
  const apiKey = 'YOUR_GOOGLE_CLOUD_VISION_API_KEY';
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{ image: { content: base64 }, features: [{ type: 'TEXT_DETECTION' }] }],
      }),
    }
  );
  const { responses } = await response.json();
  const text = responses?.[0]?.fullTextAnnotation?.text ?? '';
  return parseReceiptText(text);
  // ──────────────────────────────────────────────────────────────────────
  */
}

// Basic text parsing — extend as needed once you have real OCR output.
export function parseReceiptText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Vendor = first non-empty line that isn't a number
  const vendor = lines.find(l => /[a-zA-Z]{3,}/.test(l) && !/^\d/.test(l)) ?? '';

  // Amount = largest KES / Ksh figure found
  const amounts = text.match(/(?:KES|Ksh|KSH|kshs?)\.?\s*([\d,]+(?:\.\d{1,2})?)/gi) ?? [];
  const parsed = amounts.map(m => parseFloat(m.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
  const amount = parsed.length ? String(Math.max(...parsed)) : '';

  // Date — look for dd/mm/yyyy or dd-mm-yyyy or common written forms
  const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
  const date = dateMatch ? dateMatch[0] : '';

  return { vendor, amount, date };
}
