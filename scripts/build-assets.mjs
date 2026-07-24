#!/usr/bin/env node
/**
 * Optimizes portfolio media:
 * - Images → high-quality JPEG + WebP (visually lossless)
 * - Videos → H.264 MP4 (1080p, CRF 18) + poster frames
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CATEGORY_META,
  PROJECT_OVERRIDES,
  RESUME,
  VIRTUAL_PROJECTS,
} from './project-meta.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_ROOT =
  process.env.PORTFOLIO_SRC || '/Users/akovnoskov/Desktop/Андрей'
const OUT_IMG = path.join(ROOT, 'public', 'images', 'projects')
const OUT_DATA = path.join(ROOT, 'public', 'data', 'projects.json')

const FULL_MAX = 1920
const THUMB_MAX = 800
const MAX_IMAGES_PER_PROJECT = 40
const MAX_VIDEOS_PER_PROJECT = 8
const JPEG_QUALITY = 92
const WEBP_QUALITY = 90
const VIDEO_CRF = 18
const VIDEO_MAX_W = 1920
const VIDEO_AUDIO_BITRATE = '160k'

const SKIP_DIRS = new Set(['Лого', 'Личная информация', '.DS_Store'])
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i
const VIDEO_EXT = /\.(mp4|mov|m4v|webm)(\.mov)?$/i

const CYR = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function which(cmd) {
  const r = spawnSync('which', [cmd], { encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : ''
}

const FFMPEG = which('ffmpeg') || '/opt/homebrew/bin/ffmpeg'
const FFPROBE = which('ffprobe') || '/opt/homebrew/bin/ffprobe'
const CWEBP = which('cwebp') || '/opt/homebrew/bin/cwebp'
const SIPS = '/usr/bin/sips'

function hasBin(bin) {
  return bin && fs.existsSync(bin)
}

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .split('')
    .map((ch) => CYR[ch] ?? ch)
    .join('')
    .replace(/[''""«»]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function isStale(dest, src) {
  if (!fs.existsSync(dest)) return true
  return fs.statSync(dest).mtimeMs < fs.statSync(src).mtimeMs
}

function listMedia(dir, kind) {
  if (!fs.existsSync(dir)) return []
  const out = []
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      if (name.startsWith('.')) continue
      const full = path.join(d, name)
      let st
      try {
        st = fs.statSync(full)
      } catch {
        continue
      }
      if (st.isDirectory()) walk(full)
      else if (kind === 'image' && IMAGE_EXT.test(name)) out.push(full)
      else if (kind === 'video' && VIDEO_EXT.test(name)) out.push(full)
    }
  }
  walk(dir)
  return out.sort((a, b) => a.localeCompare(b, 'ru'))
}

function run(bin, args, label = '') {
  const r = spawnSync(bin, args, { encoding: 'utf8' })
  if (r.status !== 0) {
    if (label) console.warn(`  ! ${label}: ${r.stderr?.split('\n')[0] || 'failed'}`)
    return false
  }
  return true
}

function resizeJpeg(src, dest, maxEdge) {
  ensureDir(path.dirname(dest))
  const tmp = `${dest}.tmp.jpg`
  try {
    execFileSync(
      SIPS,
      [
        '-s', 'format', 'jpeg',
        '-s', 'formatOptions', String(JPEG_QUALITY),
        '-Z', String(maxEdge),
        src,
        '--out', tmp,
      ],
      { stdio: 'pipe' },
    )
    fs.renameSync(tmp, dest)
    return true
  } catch {
    try {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
    } catch {
      /* ignore */
    }
    return false
  }
}

function toWebp(srcJpg, destWebp) {
  if (!hasBin(CWEBP)) return false
  ensureDir(path.dirname(destWebp))
  return run(
    CWEBP,
    ['-q', String(WEBP_QUALITY), '-m', '6', '-af', '-metadata', 'all', srcJpg, '-o', destWebp],
    'cwebp',
  )
}

function processProjectImages(slug, sourcePaths) {
  const destDir = path.join(OUT_IMG, slug)
  const thumbDir = path.join(destDir, 'thumbs')
  ensureDir(thumbDir)

  const limited = sourcePaths.slice(0, MAX_IMAGES_PER_PROJECT)
  const images = []

  limited.forEach((src, i) => {
    const base = `img-${String(i + 1).padStart(3, '0')}`
    const fullJpgRel = `images/projects/${slug}/${base}.jpg`
    const fullWebpRel = `images/projects/${slug}/${base}.webp`
    const thumbJpgRel = `images/projects/${slug}/thumbs/${base}.jpg`
    const thumbWebpRel = `images/projects/${slug}/thumbs/${base}.webp`

    const fullJpg = path.join(ROOT, 'public', fullJpgRel)
    const fullWebp = path.join(ROOT, 'public', fullWebpRel)
    const thumbJpg = path.join(ROOT, 'public', thumbJpgRel)
    const thumbWebp = path.join(ROOT, 'public', thumbWebpRel)

    if (isStale(fullJpg, src) && !resizeJpeg(src, fullJpg, FULL_MAX)) return
    if (isStale(thumbJpg, src) && !resizeJpeg(src, thumbJpg, THUMB_MAX)) return
    if (!fs.existsSync(fullJpg) || !fs.existsSync(thumbJpg)) return

    if (isStale(fullWebp, fullJpg)) toWebp(fullJpg, fullWebp)
    if (isStale(thumbWebp, thumbJpg)) toWebp(thumbJpg, thumbWebp)

    images.push({
      full: fullJpgRel,
      fullWebp: fs.existsSync(fullWebp) ? fullWebpRel : null,
      thumb: thumbJpgRel,
      thumbWebp: fs.existsSync(thumbWebp) ? thumbWebpRel : null,
    })
  })

  return images
}

function processProjectVideos(slug, sourcePaths) {
  if (!hasBin(FFMPEG)) {
    if (sourcePaths.length) {
      console.warn(`  ! ffmpeg not found — skipping ${sourcePaths.length} videos`)
    }
    return []
  }

  const destDir = path.join(OUT_IMG, slug, 'videos')
  ensureDir(destDir)
  const limited = sourcePaths.slice(0, MAX_VIDEOS_PER_PROJECT)
  const videos = []

  limited.forEach((src, i) => {
    const base = `vid-${String(i + 1).padStart(3, '0')}`
    const mp4Rel = `images/projects/${slug}/videos/${base}.mp4`
    const posterJpgRel = `images/projects/${slug}/videos/${base}-poster.jpg`
    const posterWebpRel = `images/projects/${slug}/videos/${base}-poster.webp`
    const mp4Abs = path.join(ROOT, 'public', mp4Rel)
    const posterJpg = path.join(ROOT, 'public', posterJpgRel)
    const posterWebp = path.join(ROOT, 'public', posterWebpRel)

    if (isStale(mp4Abs, src)) {
      ensureDir(path.dirname(mp4Abs))
      const ok = run(
        FFMPEG,
        [
          '-y', '-i', src,
          '-vf', `scale='min(${VIDEO_MAX_W},iw)':-2`,
          '-c:v', 'libx264',
          '-preset', 'slow',
          '-crf', String(VIDEO_CRF),
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          '-c:a', 'aac',
          '-b:a', VIDEO_AUDIO_BITRATE,
          '-ac', '2',
          mp4Abs,
        ],
        `ffmpeg ${base}`,
      )
      if (!ok) return
    }

    if (!fs.existsSync(mp4Abs)) return

    if (isStale(posterJpg, mp4Abs)) {
      run(
        FFMPEG,
        [
          '-y', '-ss', '0.5', '-i', mp4Abs,
          '-frames:v', '1',
          '-q:v', '2',
          posterJpg,
        ],
        `poster ${base}`,
      )
      // Fallback: first frame if 0.5s seek fails on short clips
      if (!fs.existsSync(posterJpg)) {
        run(FFMPEG, ['-y', '-i', mp4Abs, '-frames:v', '1', '-q:v', '2', posterJpg])
      }
    }

    if (fs.existsSync(posterJpg) && isStale(posterWebp, posterJpg)) {
      toWebp(posterJpg, posterWebp)
    }

    videos.push({
      src: mp4Rel,
      poster: fs.existsSync(posterJpg) ? posterJpgRel : null,
      posterWebp: fs.existsSync(posterWebp) ? posterWebpRel : null,
    })
  })

  return videos
}

function parseFolderName(name) {
  const clean = name.trim()
  const m = clean.match(/^(\d{4})\s*[-–—]\s*(.+)$/)
  if (!m) return { year: null, title: clean }
  return { year: Number(m[1]), title: m[2].trim() }
}

function extractCity(title) {
  const m = title.match(/\(([^)]+)\)\s*$/)
  return m ? m[1].trim() : ''
}

function cleanTitle(title) {
  return title
    .replace(/\([^)]*\)\s*$/, '')
    .replace(/[‘’‛‚‹›«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeSlug(year, title) {
  const normalized = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’‛‚‹›«»"']/g, '')
  const base = slugify(normalized || title)
  return year ? `${base}-${year}` : base
}

function isEngels(slug, folderTitle) {
  return /engels/i.test(slug) || /engels/i.test(folderTitle)
}

function mergeDuplicateProjects(projects) {
  const bySlug = new Map()
  for (const p of projects) {
    let key = p.slug
    if (isEngels(p.slug, p.folderTitle)) key = 'set-kafe-engels-2020'
    if (!bySlug.has(key)) {
      bySlug.set(key, {
        ...p,
        slug: key,
        sourceDirs: [p.sourceDir],
        videos: [...p.videos],
      })
    } else if (isEngels(p.slug, p.folderTitle)) {
      const existing = bySlug.get(key)
      existing.sourceDirs.push(p.sourceDir)
      existing.images = [...new Set([...existing.images, ...p.images])]
      existing.videos = [...new Set([...existing.videos, ...p.videos])]
    } else {
      let i = 2
      let alt = `${key}-${i}`
      while (bySlug.has(alt)) {
        i += 1
        alt = `${key}-${i}`
      }
      bySlug.set(alt, {
        ...p,
        slug: alt,
        sourceDirs: [p.sourceDir],
        videos: [...p.videos],
      })
    }
  }
  return [...bySlug.values()]
}

function resolveOverrideKey(slug, folderTitle, year) {
  if (PROJECT_OVERRIDES[slug]) return slug
  const hay = `${slug} ${folderTitle}`.toLowerCase()
  const isCottage = /коттедж|kottedzh/i.test(hay)
  const isApt = /квартира|kvartira/i.test(hay)

  const pairs = [
    [/сойк|soik|soi-ka|soyka/i, 'restoran-soika-2023'],
    [/lo\s*vegano|vegano/i, 'kafe-lo-vegano-2023'],
    [/борщ|borsch|borsh/i, 'restoran-borsh-2018'],
    [/васаби|vasabi|wasabi/i, 'restoran-vasabi-2017'],
    [/барбара|barbara/i, 'restoran-barbara-2020'],
    [/бродве|brodvei|broadway/i, 'restoran-brodvei-2020'],
    [/бродск|brodskii|brodsky/i, 'restoran-brodskii-2020'],
    [/дориан|dorian/i, 'restoran-dorian-grei-2020'],
    [/engels/i, 'set-kafe-engels-2020'],
    [/армянск|armyansk/i, 'restoran-armyanskii-restoran-2024'],
    [/успенск|uspensk/i, 'torgovyi-tsentr-uspenskii-2020'],
    [/транспортн|traditsii|traditions/i, 'ofis-logisticheskoi-kompanii-transportnye-traditsii-2023'],
    [/репин|repina/i, 'podezd-zhk-repina-2022'],
    [/косул|kosul/i, 'kottedzh-kosuleno-2024'],
    [/пентхаус|penth/i, 'pentkhaus-ekaterinburg-2024'],
    [/гагарин|gagarin/i, 'kvartira-ekaterinburg-gagarina-2026'],
    [/сочи|sochi/i, 'kvartira-sochi-2025'],
    [/уральск|uralsk/i, 'kvartira-uralskii-2024'],
    [/арт\s*перм|art-perm/i, 'art-perm-2017'],
    [/картонн|kartonn/i, 'russkoe-kartonnoe-2023'],
    [/кдц|kdts|kdc/i, 'klub-kdts-2022'],
    [/center|виртуал/i, 'kluby-virtualnoi-realnosti-center-2017'],
    [/русских брендов|russkih-brendov|russkikh/i, 'magazin-magazin-russkikh-brendov-mega-2018'],
    [/музей|muzei/i, 'muzei-pri-zavode-2018'],
  ]

  for (const [re, key] of pairs) {
    if (re.test(hay) && PROJECT_OVERRIDES[key]) return key
  }

  if (/алапаевск|alapaevsk/i.test(hay) && isCottage) return 'kottedzh-alapaevsk-2025'
  if (/академ/i.test(hay) && isCottage) return 'kottedzh-ekaterinburg-akadem-gorodok-2025'
  if (/академ/i.test(hay) && isApt) return 'kvartira-ekaterinburg-akadem-gorodok-2025'
  if (/центр/i.test(hay) && isApt && year === 2023) return 'kvartira-ekaterinburg-tsentr-2023'
  if (/центр/i.test(hay) && isApt && year === 2025) return 'kvartira-ekaterinburg-tsentr-2025'

  return null
}

function buildProjects() {
  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`Source folder not found: ${SRC_ROOT}`)
    process.exit(1)
  }

  console.log(`ffmpeg: ${hasBin(FFMPEG) ? FFMPEG : 'MISSING'}`)
  console.log(`cwebp:  ${hasBin(CWEBP) ? CWEBP : 'MISSING'}`)

  ensureDir(OUT_IMG)
  ensureDir(path.dirname(OUT_DATA))

  const discovered = []

  for (const catName of fs.readdirSync(SRC_ROOT)) {
    if (SKIP_DIRS.has(catName) || catName.startsWith('.')) continue
    const catPath = path.join(SRC_ROOT, catName)
    if (!fs.statSync(catPath).isDirectory()) continue
    if (!CATEGORY_META[catName]) {
      console.warn(`Unknown category folder skipped: ${catName}`)
      continue
    }

    if (catName === 'Картины') {
      discovered.push({
        slug: 'paintings',
        category: catName,
        year: 2015,
        folderTitle: 'Авторская живопись',
        sourceDir: catPath,
        images: listMedia(catPath, 'image'),
        videos: listMedia(catPath, 'video'),
      })
      continue
    }

    for (const folder of fs.readdirSync(catPath)) {
      if (folder.startsWith('.')) continue
      const projectPath = path.join(catPath, folder)
      if (!fs.statSync(projectPath).isDirectory()) continue
      const { year, title } = parseFolderName(folder)
      const slug = makeSlug(year, title)
      discovered.push({
        slug,
        category: catName,
        year,
        folderTitle: title,
        sourceDir: projectPath,
        images: listMedia(projectPath, 'image'),
        videos: listMedia(projectPath, 'video'),
      })
    }
  }

  const merged = mergeDuplicateProjects(discovered)
  const projects = []

  for (const item of merged) {
    const overrideKey = resolveOverrideKey(item.slug, item.folderTitle, item.year)
    const override = (overrideKey && PROJECT_OVERRIDES[overrideKey]) || {}
    const cat = CATEGORY_META[item.category]
    const slug = item.slug === 'paintings' ? 'paintings' : overrideKey || item.slug
    const images = processProjectImages(slug, item.images)
    const videos = processProjectVideos(slug, item.videos)
    const cityFromFolder = extractCity(item.folderTitle)
    const titleFallback = cleanTitle(item.folderTitle)

    const coverFromImage = images[0]
    const coverFromVideo = videos[0]
    const cover = coverFromImage?.thumb || coverFromVideo?.poster || null
    const coverWebp = coverFromImage?.thumbWebp || coverFromVideo?.posterWebp || null

    const project = {
      slug,
      category: cat.slug,
      categoryRu: cat.titleRu,
      categoryEn: cat.titleEn,
      year: override.year ?? item.year,
      titleRu: override.titleRu || titleFallback,
      titleEn: override.titleEn || titleFallback,
      cityRu: override.cityRu || cityFromFolder || '',
      cityEn: override.cityEn || cityFromFolder || '',
      website: override.website || null,
      tags: override.tags || [cat.titleRu.toLowerCase()],
      descriptionRu:
        override.descriptionRu ||
        `${titleFallback}${cityFromFolder ? ` (${cityFromFolder})` : ''}. Декоративные покрытия и художественная роспись.`,
      descriptionEn:
        override.descriptionEn ||
        `${titleFallback}${cityFromFolder ? ` (${cityFromFolder})` : ''}. Decorative finishes and mural work.`,
      cover,
      coverWebp,
      images,
      videos,
      hasGallery: images.length > 0 || videos.length > 0,
      virtual: false,
    }
    projects.push(project)
    console.log(
      `✓ ${project.slug}: ${images.length} img, ${videos.length} vid`,
    )
  }

  for (const v of VIRTUAL_PROJECTS) {
    const cat = CATEGORY_META[v.category]
    if (projects.some((p) => p.slug === v.slug)) continue
    projects.push({
      slug: v.slug,
      category: cat.slug,
      categoryRu: cat.titleRu,
      categoryEn: cat.titleEn,
      year: v.year,
      titleRu: v.titleRu,
      titleEn: v.titleEn,
      cityRu: v.cityRu,
      cityEn: v.cityEn,
      website: v.website || null,
      tags: v.tags,
      descriptionRu: v.descriptionRu,
      descriptionEn: v.descriptionEn,
      cover: null,
      coverWebp: null,
      images: [],
      videos: [],
      hasGallery: false,
      virtual: true,
    })
  }

  projects.sort((a, b) => {
    const y = (b.year || 0) - (a.year || 0)
    if (y !== 0) return y
    return a.titleRu.localeCompare(b.titleRu, 'ru')
  })

  const categories = Object.values(CATEGORY_META).map((c) => ({
    slug: c.slug,
    titleRu: c.titleRu,
    titleEn: c.titleEn,
    count: projects.filter((p) => p.category === c.slug && p.hasGallery).length,
  }))

  const tagCounts = new Map()
  for (const p of projects) {
    for (const tag of p.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }
  const tags = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'))

  const data = {
    generatedAt: new Date().toISOString(),
    resume: RESUME,
    categories,
    tags,
    projects,
  }

  fs.writeFileSync(OUT_DATA, JSON.stringify(data, null, 2), 'utf8')
  console.log(
    `\nDone: ${projects.length} projects, ${tags.length} tags → ${OUT_DATA}`,
  )
}

buildProjects()
