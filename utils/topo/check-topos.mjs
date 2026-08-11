#!/usr/bin/env node
// Verify the built pages in climbing/ decrypt back to the plaintext in _topo_src/,
// using the same WebCrypto calls the browser makes. Also checks a wrong password fails
// and that no plaintext leaked into the published HTML.
//
// Usage: TOPO_PASSWORD='...' node utils/topo/check-topos.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { webcrypto as crypto } from 'node:crypto'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SRC_DIR = path.join(ROOT, '_topo_src')
const OUT_DIR = path.join(ROOT, 'climbing')

const password = process.env.TOPO_PASSWORD
if (!password) { console.error('Set TOPO_PASSWORD.'); process.exit(1) }

const b64 = s => Buffer.from(s, 'base64')

async function decrypt (payload, pw) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64(payload.salt), iterations: 310000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.ct))
  return new TextDecoder().decode(plain)
}

const payloadOf = file => JSON.parse(
  fs.readFileSync(file, 'utf8').match(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/)[1])

let failed = 0
const check = (ok, label) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}`); if (!ok) failed++ }

for (const file of fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html'))) {
  const built = path.join(OUT_DIR, file)
  const plain = await decrypt(payloadOf(built), password)

  if (file === 'index.html') {
    check(/<h1>Climbing topos<\/h1>/.test(plain), 'index.html decrypts to the listing')
    const links = [...plain.matchAll(/href="\/climbing\/([^"]+)"/g)].map(m => m[1])
    check(links.length > 0 && links.every(l => fs.existsSync(path.join(OUT_DIR, l))),
      `index links resolve (${links.length} routes)`)
  } else {
    check(plain === fs.readFileSync(path.join(SRC_DIR, file), 'utf8'), `${file} round-trips byte-for-byte`)
  }

  // The route title is deliberately shown on the gate; everything else must stay sealed.
  const published = fs.readFileSync(built, 'utf8')
  const gateTitle = published.match(/<title>([^<]*)<\/title>/)[1]
  const body = plain
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<[^>]+>/g, ' ')
  const leaked = [...new Set(body.match(/\b[A-Za-zÄÖÜäöüß]{9,}\b/g) || [])]
    .filter(w => !gateTitle.includes(w))
    .filter(w => published.includes(w))
  check(leaked.length === 0, `${file} leaks no body text${leaked.length ? ` (found: ${leaked.slice(0, 5)})` : ''}`)
}

let rejected = false
try { await decrypt(payloadOf(path.join(OUT_DIR, 'index.html')), password + 'x') } catch { rejected = true }
check(rejected, 'wrong password is rejected')

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.')
process.exit(failed ? 1 : 0)
