import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('doket.db');
  }
  return db;
}

// ── Init ──────────────────────────────────────────────────────

export async function initDatabase() {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_phone TEXT,
      status TEXT DEFAULT 'draft',
      issue_date TEXT NOT NULL,
      due_date TEXT,
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      notes TEXT,
      mpesa_link TEXT,
      paid_at TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      receipt_number TEXT,
      vendor TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT DEFAULT 'Uncategorized',
      image_uri TEXT,
      raw_ocr_text TEXT,
      notes TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ── Invoices ──────────────────────────────────────────────────

export async function getAllInvoices(userId) {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

export async function getInvoiceById(id) {
  const database = await getDatabase();
  const invoice = await database.getFirstAsync('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!invoice) return null;
  const items = await database.getAllAsync('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
  return { ...invoice, items };
}

export async function createInvoice(invoice, items) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO invoices
      (id, user_id, invoice_number, client_name, client_email, client_phone,
       status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      invoice.id, invoice.user_id, invoice.invoice_number,
      invoice.client_name, invoice.client_email ?? null, invoice.client_phone ?? null,
      invoice.status ?? 'draft', invoice.issue_date, invoice.due_date ?? null,
      invoice.subtotal, invoice.tax_rate ?? 0, invoice.tax_amount ?? 0,
      invoice.total, invoice.notes ?? null,
    ]
  );
  if (items?.length) {
    for (const item of items) {
      await database.runAsync(
        'INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, invoice.id, item.description, item.quantity, item.unit_price, item.amount]
      );
    }
  }
  return invoice;
}

export async function updateInvoice(id, updates) {
  const database = await getDatabase();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), id];
  return database.runAsync(
    `UPDATE invoices SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    values
  );
}

export async function deleteInvoice(id) {
  const database = await getDatabase();
  return database.runAsync('DELETE FROM invoices WHERE id = ?', [id]);
}

// ── Receipts ──────────────────────────────────────────────────

export async function getAllReceipts(userId) {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT * FROM receipts WHERE user_id = ? ORDER BY date DESC',
    [userId]
  );
}

export async function createReceipt(receipt) {
  const database = await getDatabase();
  return database.runAsync(
    `INSERT INTO receipts
      (id, user_id, receipt_number, vendor, amount, date, category, image_uri, raw_ocr_text, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      receipt.id, receipt.user_id, receipt.receipt_number ?? null,
      receipt.vendor, receipt.amount, receipt.date,
      receipt.category ?? 'Uncategorized', receipt.image_uri ?? null,
      receipt.raw_ocr_text ?? null, receipt.notes ?? null,
    ]
  );
}

export async function updateReceipt(id, updates) {
  const database = await getDatabase();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), id];
  return database.runAsync(
    `UPDATE receipts SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    values
  );
}

export async function deleteReceipt(id) {
  const database = await getDatabase();
  return database.runAsync('DELETE FROM receipts WHERE id = ?', [id]);
}

// ── Sync queue ────────────────────────────────────────────────

export async function addToSyncQueue(item) {
  const database = await getDatabase();
  return database.runAsync(
    'INSERT INTO sync_queue (id, entity_type, entity_id, action) VALUES (?, ?, ?, ?)',
    [item.id, item.entity_type, item.entity_id, item.action]
  );
}

export async function getPendingSyncItems() {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM sync_queue ORDER BY created_at ASC', []);
}

export async function removeSyncQueueItem(id) {
  const database = await getDatabase();
  return database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
}
