/**
 * Generates PWA icons (icon-192.png, icon-512.png) with the Cuarzo brand colors.
 * Uses only Node.js built-ins (no extra deps).
 */
import { writeFileSync } from "fs";
import { deflateSync } from "zlib";

// ── CRC32 ──────────────────────────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ── PNG chunk ──────────────────────────────────────────────────────────────
function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf    = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput  = Buffer.concat([typeBytes, data]);
  const crcBuf    = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// ── Pixel helpers ──────────────────────────────────────────────────────────
// Colors (R, G, B)
const BG      = [10, 22, 40];       // #0a1628  navy
const RING    = [226, 185, 111];    // #e2b96f  amber/gold
const DOT     = [255, 255, 255];    // white dot in center

function pixel(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const dx = x - cx + 0.5;
  const dy = y - cy + 0.5;
  const r  = Math.sqrt(dx * dx + dy * dy);

  const outerR = size * 0.40;
  const innerR = size * 0.28;
  const dotR   = size * 0.08;

  // "C" arc — full ring minus right-side gap (≈±38°)
  if (r >= innerR && r <= outerR) {
    const angle = Math.atan2(dy, dx); // -π … π
    const gap   = 0.66;               // radians (~38°)
    if (angle < -gap || angle > gap) return RING;
  }

  // Small white dot in the center
  if (r <= dotR) return DOT;

  return BG;
}

// ── PNG builder ────────────────────────────────────────────────────────────
function buildPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 2; // color type: RGB truecolor
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines (filter byte 0 = None, then R G B per pixel)
  const scanlineLen = 1 + size * 3;
  const raw = Buffer.alloc(scanlineLen * size, 0);
  for (let y = 0; y < size; y++) {
    raw[y * scanlineLen] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size);
      const off = y * scanlineLen + 1 + x * 3;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
    }
  }

  const idat = deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Generate ───────────────────────────────────────────────────────────────
for (const size of [192, 512]) {
  const out  = `public/icon-${size}.png`;
  const data = buildPNG(size);
  writeFileSync(out, data);
  console.log(`✓ ${out}  (${(data.length / 1024).toFixed(1)} KB)`);
}
