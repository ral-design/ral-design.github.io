#!/usr/bin/env node
/**
 * Writes static Open Graph / Twitter meta into dist HTML so Telegram
 * (and other crawlers) see previews without running the SPA.
 *
 * - Homepage meta lives in index.html (source of truth)
 * - Emits dist/project/{slug}/index.html per project with card cover image
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://ral-design.github.io'
const HOME_IMAGE = `${SITE}/og-image.jpg`
const META_RE = /<!-- social-meta:start -->[\s\S]*?<!-- social-meta:end -->/

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function absoluteAsset(rel) {
  if (!rel) return HOME_IMAGE
  if (/^https?:\/\//i.test(rel)) return rel
  return `${SITE}/${String(rel).replace(/^\//, '')}`
}

/** Prefer full-size cover when card points at thumbs/cover.* */
function preferFullCover(rel) {
  if (!rel) return null
  const full = String(rel).replace(/\/thumbs\/(cover\.(?:jpe?g|png|webp))$/i, '/$1')
  if (full === rel) return rel
  const onDisk = path.join(ROOT, 'public', full)
  return fs.existsSync(onDisk) ? full : rel
}

function cardPreview(project) {
  const rel =
    project.cover ||
    project.images?.[0]?.thumb ||
    project.videos?.[0]?.poster ||
    null
  return absoluteAsset(preferFullCover(rel))
}

function buildMetaBlock({ title, description, url, image, type = 'website' }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const u = escapeHtml(url)
  const img = escapeHtml(image)
  return `<!-- social-meta:start -->
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${u}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:site_name" content="Андрей — художник-декоратор" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${u}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:alt" content="${t}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <!-- social-meta:end -->`
}

function applyPage(html, meta) {
  if (!META_RE.test(html)) {
    throw new Error('Missing <!-- social-meta:start/end --> markers in HTML')
  }
  return html
    .replace(META_RE, buildMetaBlock(meta))
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
}

function main() {
  const indexPath = path.join(DIST, 'index.html')
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing ${indexPath}. Run vite build first.`)
  }

  const dataPath = path.join(DIST, 'data', 'projects.json')
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Missing ${dataPath}`)
  }

  const html = fs.readFileSync(indexPath, 'utf8')
  const { projects } = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  let written = 0

  for (const project of projects) {
    const title = `${project.titleRu} — Андрей, художник-декоратор`
    const description =
      project.descriptionRu ||
      'Художник-декоратор: декоративная штукатурка и художественная роспись. Портфолио Андрея.'
    const pageHtml = applyPage(html, {
      title,
      description,
      url: `${SITE}/project/${project.slug}`,
      image: cardPreview(project),
      type: 'article',
    })
    const outDir = path.join(DIST, 'project', project.slug)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml)
    written += 1
  }

  // Keep SPA fallback in sync with homepage meta.
  fs.copyFileSync(indexPath, path.join(DIST, '404.html'))

  console.log(`prerender-meta: wrote ${written} project pages + 404.html`)
}

main()
