#!/usr/bin/env bash
#
# Оптимизирует исходные фотографии и собирает манифест галереи.
# Требует macOS-утилиту sips (входит в систему) и node.
#
# Использование:
#   ./scripts/build-assets.sh
#
# Исходные папки можно переопределить через переменные окружения:
#   ART_SRC=... DECOR_SRC=... ./scripts/build-assets.sh

set -euo pipefail

# --- Настройки ---------------------------------------------------------------
ART_SRC="${ART_SRC:-/Users/akovnoskov/Desktop/Андрей/Арт}"
DECOR_SRC="${DECOR_SRC:-/Users/akovnoskov/Desktop/Андрей/Декоративка}"

FULL_MAX=1800   # максимальная сторона для полноразмерного просмотра
THUMB_MAX=800   # максимальная сторона для превью в сетке
JPEG_QUALITY=72 # качество jpeg (0-100)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG_DIR="$ROOT/assets/img"
DATA_DIR="$ROOT/data"

# --- Обработка одной категории ----------------------------------------------
# $1 — исходная папка, $2 — ключ категории (art|decor)
# Видео намеренно пропускаются: сайт публикуется на GitHub Pages, где важны
# лёгкий вес и лимит 100 МБ на файл. В портфолио идут только фотографии.
process_category() {
  local src="$1" key="$2"
  local out_full="$IMG_DIR/$key"
  local out_thumb="$IMG_DIR/$key/thumbs"

  mkdir -p "$out_full" "$out_thumb"

  if [[ ! -d "$src" ]]; then
    echo "!! Исходная папка не найдена: $src" >&2
    return
  fi

  local i=0
  shopt -s nullglob nocaseglob
  for file in "$src"/*.{jpg,jpeg,png,heic}; do
    [[ -e "$file" ]] || continue
    local base
    base="$(basename "$file")"
    i=$((i + 1))
    local name="${key}-$(printf '%03d' "$i")"

    # Полный размер
    sips -s format jpeg -s formatOptions "$JPEG_QUALITY" \
      -Z "$FULL_MAX" "$file" --out "$out_full/$name.jpg" >/dev/null 2>&1 || {
        echo "!! Пропущен (ошибка sips): $base" >&2; continue; }
    # Превью
    sips -s format jpeg -s formatOptions "$JPEG_QUALITY" \
      -Z "$THUMB_MAX" "$file" --out "$out_thumb/$name.jpg" >/dev/null 2>&1 || true
    echo "image: $name.jpg"
  done
  shopt -u nullglob nocaseglob
}

echo "==> Очистка старых ассетов"
rm -rf "$IMG_DIR/art" "$IMG_DIR/decor"
mkdir -p "$IMG_DIR/art/thumbs" "$IMG_DIR/decor/thumbs" "$DATA_DIR"

echo "==> Обработка категории «Арт»"
process_category "$ART_SRC" "art"

echo "==> Обработка категории «Декоративка»"
process_category "$DECOR_SRC" "decor"

echo "==> Генерация манифеста"
node "$ROOT/scripts/generate-manifest.js"

echo "==> Готово"
