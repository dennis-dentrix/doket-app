/**
 * Generates placeholder PNG assets for Doket using only Node.js built-ins.
 * Run: node scripts/generate-assets.js
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ─── CRC-32 table (used by PNG chunk checksums) ───────────────────────────
const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++)
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Creates a solid-color PNG with an optional centered circle for icon variant.
 * @param {number} w - width
 * @param {number} h - height
 * @param {{ bg: number[], fg?: number[], circle?: boolean }} opts
 */
function makePNG(w, h, { bg, fg, circle = false }) {
  const [br, bg_, bb] = bg;
  const [fr, fg_, fb] = fg || bg;

  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  // Raw scanlines: filter byte (0x00) + RGB per pixel
  const raw = Buffer.allocUnsafe((w * 3 + 1) * h);
  const cx = w / 2, cy = h / 2, radius = Math.min(w, h) * 0.35;

  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0; // None filter
    for (let x = 0; x < w; x++) {
      const off = y * (w * 3 + 1) + 1 + x * 3;
      const inCircle = circle && Math.hypot(x - cx, y - cy) <= radius;
      raw[off]     = inCircle ? fr : br;
      raw[off + 1] = inCircle ? fg_ : bg_;
      raw[off + 2] = inCircle ? fb : bb;
    }
  }

  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    PNG_SIG,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const ORANGE = [255, 107, 53];   // #FF6B35
const NAVY   = [0,  78, 137];    // #004E89
const CREAM  = [248, 246, 241];  // #F8F6F1
const WHITE  = [255, 255, 255];

const assetsDir = path.join(__dirname, '..', 'assets');

const assets = [
  // App icon — orange bg + white circle mark
  { file: 'icon.png',          w: 1024, h: 1024, bg: ORANGE, fg: WHITE,  circle: true },
  // Android adaptive icon foreground — same
  { file: 'adaptive-icon.png', w: 1024, h: 1024, bg: ORANGE, fg: WHITE,  circle: true },
  // Splash screen — navy bg
  { file: 'splash.png',        w: 1284, h: 2778, bg: NAVY,   fg: ORANGE, circle: true },
  // Favicon — small
  { file: 'favicon.png',       w:  196, h:  196, bg: ORANGE, fg: WHITE,  circle: false },
];

for (const { file, w, h, bg, fg, circle } of assets) {
  const png = makePNG(w, h, { bg, fg, circle });
  const dest = path.join(assetsDir, file);
  fs.writeFileSync(dest, png);
  console.log(`✓ ${file}  (${w}×${h}, ${(png.length / 1024).toFixed(0)} KB)`);
}

console.log('\nAssets generated in mobile/assets/');
