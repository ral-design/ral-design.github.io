#!/usr/bin/env node
/**
 * Rebuild thumbs + LQIP blur previews from existing full JPEGs in public/.
 * Does not touch projects.json paths.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_IMG = path.join(ROOT, 'public', 'images', 'projects')

const THUMB_MAX = 960
const BLUR_MAX = 32
const THUMB_JPEG_QUALITY = 90
const THUMB_WEBP_QUALITY = 88
const BLUR_WEBP_QUALITY = 40

function which(cmd) {
  const r = spawnSync('which', [cmd], { encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : ''
}

const SIPS = which('sips') || '/usr/bin/sips'
const CWEBP = which('cwebp') || '/opt/homebrew/bin/cwebp'

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function resizeJpeg(src, dest, maxEdge, quality) {
  ensureDir(path.dirname(dest))
  const tmp = `${dest}.tmp.jpg`
  try {
    execFileSync(
      SIPS,
      [
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        String(quality),
        '-Z',
        String(maxEdge),
        src,
        '--out',
        tmp,
      ],
      { stdio: 'pipe' },
    )
    fs.renameSync(tmp, dest)
    return true
  } catch {
    try {
      fs.unlinkSync(tmp)
    } catch {
      /* ignore */
    }
    return false
  }
}

function toWebp(srcJpg, destWebp, quality) {
  ensureDir(path.dirname(destWebp))
  const r = spawnSync(
    CWEBP,
    ['-q', String(quality), '-m', '6', '-af', srcJpg, '-o', destWebp],
    { encoding: 'utf8' },
  )
  return r.status === 0
}

function makeBlur(srcJpg, destBlurWebp) {
  const tmp = `${destBlurWebp}.tmp.jpg`
  if (!resizeJpeg(srcJpg, tmp, BLUR_MAX, 60)) return false
  const ok = toWebp(tmp, destBlurWebp, BLUR_WEBP_QUALITY)
  try {
    fs.unlinkSync(tmp)
  } catch {
    /* ignore */
  }
  return ok
}

function listProjectDirs() {
  if (!fs.existsSync(OUT_IMG)) return []
  return fs
    .readdirSync(OUT_IMG, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(OUT_IMG, d.name))
}

function fullJpgsIn(projectDir) {
  return fs
    .readdirSync(projectDir)
    .filter((n) => /^[\w.-]+\.jpe?g$/i.test(n) && !n.includes('.tmp.'))
    .map((n) => path.join(projectDir, n))
}

let thumbs = 0
let blurs = 0
let failed = 0

for (const dir of listProjectDirs()) {
  const thumbDir = path.join(dir, 'thumbs')
  ensureDir(thumbDir)
  const slug = path.basename(dir)

  for (const fullJpg of fullJpgsIn(dir)) {
    const base = path.basename(fullJpg).replace(/\.jpe?g$/i, '')
    const thumbJpg = path.join(thumbDir, `${base}.jpg`)
    const thumbWebp = path.join(thumbDir, `${base}.webp`)
    const blurWebp = path.join(thumbDir, `${base}.blur.webp`)

    // Also place blur next to display path used on home covers (thumbs/cover.*)
    if (!resizeJpeg(fullJpg, thumbJpg, THUMB_MAX, THUMB_JPEG_QUALITY)) {
      console.warn(`! thumb fail ${slug}/${base}`)
      failed++
      continue
    }
    if (!toWebp(thumbJpg, thumbWebp, THUMB_WEBP_QUALITY)) {
      console.warn(`! webp fail ${slug}/${base}`)
      failed++
      continue
    }
    thumbs++

    if (makeBlur(thumbJpg, blurWebp)) blurs++
    else {
      console.warn(`! blur fail ${slug}/${base}`)
      failed++
    }
  }
}

console.log(`Rebuilt thumbs: ${thumbs}, blur LQIP: ${blurs}, failed: ${failed}`)
