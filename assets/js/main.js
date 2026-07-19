(function () {
  'use strict';

  var data = window.PORTFOLIO_DATA || { items: [], categories: [] };
  var items = data.items || [];

  var grid = document.getElementById('grid');
  var filtersEl = document.getElementById('filters');
  var currentFilter = 'all';
  // Список элементов, видимых при текущем фильтре (для навигации в лайтбоксе)
  var visible = [];

  var CATEGORY_TITLE = {};
  (data.categories || []).forEach(function (c) {
    CATEGORY_TITLE[c.key] = c.title;
  });

  // --- Отрисовка сетки -------------------------------------------------------
  function render() {
    grid.innerHTML = '';
    visible = items.filter(function (it) {
      return currentFilter === 'all' || it.category === currentFilter;
    });

    if (!visible.length) {
      var empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'В этой категории пока нет работ.';
      grid.appendChild(empty);
      return;
    }

    visible.forEach(function (it, index) {
      var card = document.createElement('a');
      card.className = 'card';
      card.href = 'javascript:void(0)';
      card.style.animationDelay = Math.min(index * 30, 400) + 'ms';
      card.addEventListener('click', function () {
        openLightbox(index);
      });

      if (it.type === 'video') {
        var vid = document.createElement('video');
        vid.src = it.src;
        vid.muted = true;
        vid.preload = 'metadata';
        vid.playsInline = true;
        card.appendChild(vid);
        var play = document.createElement('span');
        play.className = 'play';
        card.appendChild(play);
      } else {
        var img = document.createElement('img');
        img.src = it.thumb;
        img.loading = 'lazy';
        img.alt = (CATEGORY_TITLE[it.category] || '') + ' — работа';
        card.appendChild(img);
      }

      var overlay = document.createElement('div');
      overlay.className = 'overlay';
      var tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = CATEGORY_TITLE[it.category] || '';
      overlay.appendChild(tag);
      card.appendChild(overlay);

      grid.appendChild(card);
    });
  }

  // --- Фильтры ---------------------------------------------------------------
  filtersEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter');
    if (!btn) return;
    currentFilter = btn.getAttribute('data-filter');
    filtersEl.querySelectorAll('.filter').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    render();
  });

  // --- Лайтбокс --------------------------------------------------------------
  var lightbox = document.getElementById('lightbox');
  var stage = document.getElementById('lb-stage');
  var lbIndex = 0;

  function showAt(index) {
    if (!visible.length) return;
    lbIndex = (index + visible.length) % visible.length;
    var it = visible[lbIndex];
    stage.innerHTML = '';
    if (it.type === 'video') {
      var v = document.createElement('video');
      v.src = it.src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      stage.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = it.full;
      img.alt = (CATEGORY_TITLE[it.category] || '') + ' — работа';
      stage.appendChild(img);
    }
  }

  function openLightbox(index) {
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showAt(index);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stage.innerHTML = '';
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', function () {
    showAt(lbIndex - 1);
  });
  document.getElementById('lb-next').addEventListener('click', function () {
    showAt(lbIndex + 1);
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showAt(lbIndex - 1);
    else if (e.key === 'ArrowRight') showAt(lbIndex + 1);
  });

  // --- Статистика и год ------------------------------------------------------
  function countBy(key) {
    return items.filter(function (it) { return it.category === key; }).length;
  }
  var statArt = document.getElementById('stat-art');
  var statDecor = document.getElementById('stat-decor');
  if (statArt) statArt.textContent = countBy('art');
  if (statDecor) statDecor.textContent = countBy('decor');
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  render();
})();
