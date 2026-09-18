const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height) {
  // RGBA buffer
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate normalized coords
      const nx = x / width;
      const ny = y / height;
      
      // Blue gradient #2563eb to #1d4ed8
      let r = Math.round(37 + (29 - 37) * ny);
      let g = Math.round(99 + (78 - 99) * ny);
      let b = Math.round(235 + (216 - 235) * ny);

      // Distance from center for logo elements
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;

      // Draw academic cap diamond
      const capHalfW = width * 0.32;
      const capHalfH = height * 0.15;
      const capY = cy - height * 0.08;
      
      const diamondDist = (Math.abs(x - cx) / capHalfW) + (Math.abs(y - capY) / capHalfH);
      if (diamondDist <= 1.0) {
        r = 255;
        g = 255;
        b = 255;
      }

      // Draw open book pages below
      const bookTop = cy + height * 0.05;
      const bookBottom = cy + height * 0.28;
      const bookW = width * 0.35;
      if (y >= bookTop && y <= bookBottom && Math.abs(dx) <= bookW) {
        const spineDist = Math.abs(dx);
        if (spineDist > width * 0.02) {
          r = 248;
          g = 250;
          b = 252;
        } else {
          r = 203;
          g = 213;
          b = 225;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255; // Alpha
    }
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk (compressed pixel data)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  
  // CRC32
  const crc = calculateCrc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 Table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function calculateCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

fs.writeFileSync('public/icon-192.png', createPng(192, 192));
fs.writeFileSync('public/icon-512.png', createPng(512, 512));
console.log('PNG icons successfully generated in /public/');
