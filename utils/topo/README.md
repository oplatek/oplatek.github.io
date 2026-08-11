# Password-gated climbing topos

GitHub Pages serves static files only — there is no server, so no HTTP basic auth and no
login. Instead the topos are **encrypted at build time** and decrypted in the reader's
browser: only ciphertext is ever committed or served.

- **AES-256-GCM**, key derived with **PBKDF2-HMAC-SHA256, 310 000 iterations**, fresh
  random salt + IV per file.
- A wrong password fails the GCM authentication tag, so there is no separate "is the
  password right" check sitting in the page for someone to patch out.
- The **listings are encrypted too**, so route and area names are not public either — only
  the URL slugs are (`/climbing/grosses-priel/01-gesamter-suedgrat-grosser-priel.html`).
- One unlock per browser tab: the password is kept in `sessionStorage` and reused across
  topos, then discarded when the tab closes.
- `robots.txt` disallows `/climbing/` and every page carries `noindex, nofollow`.

## Layout

`_topo_src/` is mirrored into `climbing/`, so **one folder per area**:

```
_topo_src/grosses-priel/01-gesamter-suedgrat-grosser-priel.html
                     -> opla.cz/climbing/grosses-priel/01-gesamter-suedgrat-grosser-priel.html
```

Every folder gets its own gated `index.html` listing what is inside it, and
`/climbing/` lists the areas with a route count. Adding an area is just a new folder —
no code change. The folder name becomes the heading (`grosses-priel` → "Grosses Priel"),
a leading `01-` style sort prefix is stripped, and nesting deeper than one level works
too. Empty folders are skipped rather than published as dead links. Each page carries a
back-link to its parent.

## Workflow

Plaintext topos live in `_topo_src/`, which is **gitignored** (and, starting with `_`,
also ignored by Jekyll). Add or edit files there, then:

```sh
node utils/topo/build-topos.mjs        # prompts for the password
```

This rewrites `climbing/` — one gate page per topo plus an encrypted `index.html`.
Commit `climbing/`; never commit `_topo_src/`.

To verify a build (round-trips byte-for-byte, wrong password rejected, no plaintext
leaked into the published HTML):

```sh
TOPO_PASSWORD='...' node utils/topo/check-topos.mjs
```

Changing the password, or adding a topo, means rebuilding all of `climbing/` — that is
what the script does, so just re-run it.

## Choosing the password

The ciphertext is public on GitHub, so anyone can attempt an **offline** brute force
against it at their own pace. PBKDF2 at 310 k iterations makes each guess cost real work,
but that only buys time — the password itself has to carry the security. Use a
passphrase of several random words, not a word plus a number. The script refuses anything
under 10 characters.

The pages are not linked from anywhere on the site; share the URL and the password with
your climbing partners directly.
