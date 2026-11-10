#!/usr/bin/env node
/**
 * Generates the PWA icon set without any image dependency.
 * Every pixel is rendered procedurally and encoded as a PNG via node:zlib.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(size, pixels) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0
    pixels.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const SKYLINE = [
  [-1.0, -0.55, 0.34],
  [-0.55, -0.28, 0.52],
  [-0.3, -0.02, 0.26],
  [0.0, 0.3, 0.44],
  [0.28, 0.52, 0.3],
  [0.5, 0.72, 0.5],
  [0.7, 0.92, 0.36],
  [0.9, 1.0, 0.46],
]

function shade(normalizedX, normalizedY, padding) {
  const x = normalizedX / padding
  const y = normalizedY / padding

  let r = 4
  let g = 7
  let b = 14

  const depth = (y + 1) / 2
  r += 6 * (1 - depth)
  g += 15 * (1 - depth)
  b += 27 * (1 - depth)

  const moonX = 0.2
  const moonY = -0.28
  const moonDistance = Math.hypot(x - moonX, y - moonY)
  const cutDistance = Math.hypot(x - (moonX + 0.13), y - (moonY + 0.1))

  if (moonDistance < 0.62) {
    const glow = (1 - moonDistance / 0.62) ** 2 * 0.5
    r += 34 * glow
    g += 96 * glow
    b += 132 * glow
  }

  const isMoon = moonDistance < 0.235 && cutDistance > 0.2
  if (isMoon) {
    const rim = Math.min(1, (0.235 - moonDistance) * 18)
    r = 214 + 30 * rim
    g = 235 + 15 * rim
    b = 250
  }

  const ring = Math.abs(Math.hypot(x, y + 0.02) - 0.68)
  if (ring < 0.016) {
    r = 56
    g = 189
    b = 248
  }

  if (y > 0.66) {
    const inBuilding = SKYLINE.some(([from, to, height]) => x >= from && x <= to && y > 0.99 - height)
    if (inBuilding) {
      r = 5
      g = 11
      b = 19
      const column = Math.floor((x + 1) * 14)
      const row = Math.floor((y - 0.66) * 22)
      if ((column * 5 + row * 3) % 7 === 0 && y > 0.72) {
        r = 96
        g = 190
        b = 235
      }
    }
  }

  const vignette = Math.min(1, Math.hypot(x, y) / 1.45)
  r *= 1 - vignette * 0.45
  g *= 1 - vignette * 0.45
  b *= 1 - vignette * 0.35

  return [Math.max(0, Math.min(255, Math.round(r))), Math.max(0, Math.min(255, Math.round(g))), Math.max(0, Math.min(255, Math.round(b))), 255]
}

function render(size, padding) {
  const pixels = Buffer.alloc(size * size * 4)
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const nx = ((px + 0.5) / size) * 2 - 1
      const ny = ((py + 0.5) / size) * 2 - 1
      const [r, g, b, a] = shade(nx, ny, padding)
      const offset = (py * size + px) * 4
      pixels[offset] = r
      pixels[offset + 1] = g
      pixels[offset + 2] = b
      pixels[offset + 3] = a
    }
  }
  return encodePng(size, pixels)
}

const targets = [
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['icon-512-maskable.png', 512, 0.74],
  ['apple-touch-icon.png', 180, 0.92],
]

for (const [name, size, padding] of targets) {
  const file = join(outDir, name)
  writeFileSync(file, render(size, padding))
  console.log(`wrote ${file} (${size}x${size})`)
}

// Safari/Android maskable copy also lives at the public root for older manifests.
writeFileSync(join(root, 'public', 'apple-touch-icon.png'), render(180, 0.92))
console.log('wrote public/apple-touch-icon.png')
