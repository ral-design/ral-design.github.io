# Портфолио — художник-декоратор

React-сайт портфолио (Vite + React 19): проекты по декоративной штукатурке,
художественной росписи и интерьерам. Дизайн в духе галереи Art. Lebedev.

## Запуск

```bash
npm install
npm run build:assets   # один раз: оптимизация фото и data/projects.json
npm run dev
```

Откройте адрес из терминала (обычно `http://localhost:5173/Decorative-artist/`).

## Сборка

```bash
npm run build
npm run preview
```

Статика попадает в `dist/`. Базовый путь — `/Decorative-artist/` (GitHub Pages).

## Обновление фото

Исходники: `/Users/akovnoskov/Desktop/Андрей`  
(папки по типам помещений; внутри — папки проектов вида `YYYY - Название`).

```bash
npm run build:assets
# или другой путь:
PORTFOLIO_SRC="/путь/к/папке" npm run build:assets
```

Скрипт оптимизирует медиа без заметной потери качества:

- фото → JPEG q92 (до 1920 px) + WebP q90 (превью до 800 px)
- видео → H.264 MP4 (до 1080p, CRF 18, `faststart`) + poster-кадр

Результат: `public/images/projects/` и `public/data/projects.json`.

На сайте изображения и видео подгружаются лениво (Intersection Observer +
`loading="lazy"` / `preload="none"`).

## Структура

- `src/` — React UI (шапка, фильтры, сетка, поиск, детальная страница)
- `scripts/build-assets.mjs` — импорт и оптимизация фото/видео
- `scripts/project-meta.mjs` — описания, теги, резюме
- `public/data/projects.json` — данные сайта
- `public/images/projects/` — оптимизированные фото и видео

## Контакт

Кнопка «Связаться» ведёт в Telegram: [@Shiva69om](https://t.me/Shiva69om).
