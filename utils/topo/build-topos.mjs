#!/usr/bin/env node
// Encrypt the climbing topos in _topo_src/ into password-gated pages under climbing/.
//
// GitHub Pages serves static files only, so there is no server-side auth. Instead each
// topo is encrypted with AES-256-GCM under a key derived from a shared password
// (PBKDF2-HMAC-SHA256). Only the ciphertext is committed; the browser decrypts it after
// the reader types the password. A wrong password fails the GCM auth tag, so there is no
// separate password check to bypass.
//
// Usage:  TOPO_PASSWORD='...' node utils/topo/build-topos.mjs
//         node utils/topo/build-topos.mjs          # prompts for the password

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SRC_DIR = path.join(ROOT, '_topo_src')
const OUT_DIR = path.join(ROOT, 'climbing')
const ITERATIONS = 310000 // OWASP 2023 floor for PBKDF2-HMAC-SHA256
const COLLECTION_TITLE = 'Climbing topos'

function readPassword () {
  if (process.env.TOPO_PASSWORD) return process.env.TOPO_PASSWORD
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  const write = process.stdout.write.bind(process.stdout)
  return new Promise(resolve => {
    write('Password for the topos: ')
    process.stdout.write = () => true // suppress the echo, and only the echo
    rl.question('', answer => {
      process.stdout.write = write
      rl.close()
      write('\n')
      resolve(answer.trim())
    })
  })
}

function encrypt (plaintext, password) {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  // WebCrypto expects the GCM tag appended to the ciphertext.
  return {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ct: Buffer.concat([body, cipher.getAuthTag()]).toString('base64')
  }
}

const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function gatePage ({ title, payload, backLink, backLabel }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)}</title>
<style>
:root{--ink:#1b1d1c;--ink-2:#4a504d;--line:#d9dcda;--bg:#fbfaf7;--accent:#2f6f4f;--err:#a3352b}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);display:grid;place-items:center;min-height:100vh;
  font:16px/1.55 ui-sans-serif,system-ui,-apple-system,sans-serif}
.gate{width:min(420px,92vw);padding:28px 26px 24px;background:#fff;border:1px solid var(--line);border-radius:10px}
h1{font-size:19px;margin:0 0 6px}
p{color:var(--ink-2);font-size:14px;margin:0 0 18px}
label{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);margin:0 0 6px}
input{width:100%;padding:11px 12px;font-size:16px;border:1px solid var(--line);border-radius:7px;background:var(--bg)}
input:focus{outline:2px solid var(--accent);outline-offset:1px}
button{width:100%;margin-top:12px;padding:11px 12px;font-size:15px;font-weight:600;color:#fff;
  background:var(--accent);border:0;border-radius:7px;cursor:pointer}
button[disabled]{opacity:.6;cursor:progress}
.msg{margin:12px 0 0;font-size:13.5px;min-height:1.2em}
.msg.err{color:var(--err)}
.back{position:fixed;top:10px;right:12px;z-index:9;font:12px/1 ui-sans-serif,system-ui,sans-serif;
  background:#fff;border:1px solid #d9dcda;border-radius:99px;padding:7px 12px;color:#2f6f4f;text-decoration:none}
</style></head>
<body>
<form class="gate" id="gate" autocomplete="on">
  <h1>${escapeHtml(title)}</h1>
  <p>This page is encrypted. Enter the password to read it.</p>
  <label for="pw">Password</label>
  <input id="pw" name="password" type="password" autocomplete="current-password" autofocus>
  <button type="submit" id="go">Unlock</button>
  <p class="msg" id="msg"></p>
</form>
<script id="payload" type="application/json">${JSON.stringify(payload)}</script>
<script>
(function () {
  var data = JSON.parse(document.getElementById('payload').textContent)
  var ITER = ${ITERATIONS}
  var KEY = 'topo-pw'
  var BACK = ${JSON.stringify(backLink || '')}
  var BACK_LABEL = ${JSON.stringify(backLabel || 'all topos')}
  var form = document.getElementById('gate')
  var input = document.getElementById('pw')
  var button = document.getElementById('go')
  var msg = document.getElementById('msg')

  function b64 (s) {
    var raw = atob(s), out = new Uint8Array(raw.length)
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
    return out
  }

  async function decrypt (password) {
    var enc = new TextEncoder()
    var base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
    var key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(data.salt), iterations: ITER, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(data.iv) }, key, b64(data.ct))
    return new TextDecoder().decode(plain)
  }

  function render (html) {
    if (BACK) {
      var label = BACK_LABEL.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      var link = '<a class="back" href="' + BACK + '">\\u2190 ' + label + '</a>'
      var style = '<style>.back{position:fixed;top:10px;right:12px;z-index:9;' +
        'font:12px/1 ui-sans-serif,system-ui,sans-serif;background:#fff;border:1px solid #d9dcda;' +
        'border-radius:99px;padding:7px 12px;color:#2f6f4f;text-decoration:none}</style>'
      html = html.replace(/<body([^>]*)>/i, function (m) { return m + style + link })
    }
    document.open()
    document.write(html)
    document.close()
  }

  async function attempt (password, fromCache) {
    button.disabled = true
    msg.className = 'msg'
    msg.textContent = 'Decrypting\\u2026'
    try {
      var html = await decrypt(password)
      try { sessionStorage.setItem(KEY, password) } catch (e) {}
      render(html)
    } catch (e) {
      try { if (fromCache) sessionStorage.removeItem(KEY) } catch (e2) {}
      button.disabled = false
      msg.className = 'msg err'
      msg.textContent = fromCache ? '' : 'Wrong password.'
      input.select()
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value) attempt(input.value, false)
  })

  // Unlock once per tab: reuse the password across topos within the session.
  var cached = null
  try { cached = sessionStorage.getItem(KEY) } catch (e) {}
  if (cached) attempt(cached, true)
})()
</script>
</body></html>
`
}

function indexDocument (heading, entries) {
  const items = entries.map(e =>
    `  <li><a href="${escapeHtml(e.href)}">${escapeHtml(e.title)}` +
    (e.note ? `<span class="note">${escapeHtml(e.note)}</span>` : '') +
    '</a></li>').join('\n')
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(heading)}</title>
<style>
body{margin:0;background:#fbfaf7;color:#1b1d1c;
  font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}
.wrap{max-width:700px;margin:0 auto;padding:48px 26px 80px}
h1{font-size:28px;margin:0 0 6px;letter-spacing:-.01em}
p.sub{color:#4a504d;font-size:15px;margin:0 0 28px;
  font-family:ui-sans-serif,system-ui,sans-serif}
ul{list-style:none;padding:0;margin:0}
li{border-top:1px solid #e6e8e6}
li:last-child{border-bottom:1px solid #e6e8e6}
li a{display:flex;justify-content:space-between;align-items:baseline;gap:14px;
  padding:16px 4px;color:#2f6f4f;text-decoration:none;font-size:18px}
li a:hover{background:#e8f0eb}
li .note{font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;color:#4a504d;white-space:nowrap}
</style></head>
<body><div class="wrap">
<h1>${escapeHtml(heading)}</h1>
<p class="sub">Route guides. Planning documents — verify against the printed topo before you tie in.</p>
<ul>
${items}
</ul>
</div></body></html>
`
}

// "grosses-priel" -> "Grosses Priel". Drop a leading sort prefix like "01-" if present.
const humanize = slug => slug
  .replace(/^\d+[-_]/, '')
  .split(/[-_]/)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ')

const routeTitle = (html, file) =>
  (html.match(/<title>([^<]*)<\/title>/i)?.[1] || humanize(file.replace(/\.html$/, '')))
    .replace(/\s+—\s+route guide$/i, '')

// Mirror the shape of _topo_src/ into climbing/: every subfolder becomes an area with its
// own gated index, so new areas need no changes here — just a new folder.
function buildDir (relDir, password, log) {
  const srcDir = path.join(SRC_DIR, relDir)
  const outDir = path.join(OUT_DIR, relDir)
  const dirUrl = '/climbing/' + (relDir ? relDir + '/' : '')
  const urlOf = name => dirUrl + name
  const isRoot = relDir === ''
  const areaTitle = isRoot ? COLLECTION_TITLE : humanize(path.basename(relDir))
  const parentDir = path.dirname(relDir)
  const parentUrl = isRoot ? '' : '/climbing/' + (parentDir === '.' ? '' : parentDir + '/')
  const parentLabel = isRoot ? '' : (parentDir === '.' ? COLLECTION_TITLE : humanize(parentDir))

  fs.mkdirSync(outDir, { recursive: true })
  const listed = []
  let routeCount = 0

  for (const item of fs.readdirSync(srcDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (item.name.startsWith('.')) continue

    if (item.isDirectory()) {
      const sub = buildDir(path.join(relDir, item.name), password, log)
      if (!sub.routeCount) continue // skip empty folders rather than publishing a dead link
      listed.push({ title: sub.areaTitle, href: urlOf(item.name) + '/', note: sub.routeCount + (sub.routeCount === 1 ? ' route' : ' routes') })
      routeCount += sub.routeCount
      continue
    }
    if (!item.name.endsWith('.html')) continue

    const html = fs.readFileSync(path.join(srcDir, item.name), 'utf8')
    const title = routeTitle(html, item.name)
    fs.writeFileSync(path.join(outDir, item.name), gatePage({
      title,
      payload: encrypt(html, password),
      backLink: dirUrl,
      backLabel: areaTitle
    }))
    listed.push({ title, href: urlOf(item.name) })
    routeCount++
    log(`  encrypted  ${path.posix.join('climbing', relDir, item.name)}  (${title})`)
  }

  // The listing is encrypted too, so route and area names are not public either.
  fs.writeFileSync(path.join(outDir, 'index.html'), gatePage({
    title: areaTitle,
    payload: encrypt(indexDocument(areaTitle, listed), password),
    backLink: parentUrl,
    backLabel: parentLabel
  }))
  log(`  encrypted  ${path.posix.join('climbing', relDir, 'index.html')}  (index of ${listed.length})`)

  return { areaTitle, routeCount }
}

const password = await readPassword()
if (!password) { console.error('No password given.'); process.exit(1) }
if (password.length < 10) {
  console.error(`Refusing: the password is ${password.length} characters. The ciphertext is public on GitHub,`)
  console.error('so a short password is brute-forceable offline. Use 12+ characters or a passphrase.')
  process.exit(1)
}

if (!fs.existsSync(SRC_DIR)) { console.error(`Missing ${SRC_DIR}`); process.exit(1) }

// Wipe the whole output tree so renamed or deleted topos cannot linger as live URLs.
fs.rmSync(OUT_DIR, { recursive: true, force: true })

const { routeCount } = buildDir('', password, console.log)
if (!routeCount) {
  console.error(`No .html topos found under ${SRC_DIR}`)
  process.exit(1)
}
console.log(`\nDone — ${routeCount} routes. ${ITERATIONS.toLocaleString('en-US')} PBKDF2 iterations, AES-256-GCM.`)
console.log('Commit climbing/ — never _topo_src/.')
