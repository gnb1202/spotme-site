/* ============================================================
   SPOT ME — 사이트 인터랙션
   진입 리빌 / 커서 글로우 / 내비 / Core Loop sticky / 스테이지 맵
   / 티어 스크러버 / 컬러 스와치 복사 / 스크린 아카이브 + 라이트박스
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 토스트 ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 1900);
  }

  /* ---------- 진입 리빌 ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .plateau-chart').forEach(function (el) { revealIO.observe(el); });

  /* ---------- 정체기 그래프: 선 길이 계산 ---------- */
  var plateauLine = $('.plateau-line');
  if (plateauLine && plateauLine.getTotalLength) {
    var len = Math.ceil(plateauLine.getTotalLength());
    plateauLine.style.setProperty('--len', len);
  }

  /* ---------- 커서 글로우 ---------- */
  var glow = $('.cursor-glow');
  if (glow && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    var tx = gx, ty = gy, raf = null;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('has-pointer');
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    function follow() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.setProperty('--gx', gx + 'px');
      glow.style.setProperty('--gy', gy + 'px');
      raf = (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5)
        ? requestAnimationFrame(follow) : null;
    }
  }

  /* ---------- 내비게이션: 스크롤 상태 / 진행률 / 활성 링크 ---------- */
  var nav = $('.nav');
  var navLinks = $$('.nav-link');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  var lightZone = $('#casestudy');

  function onScroll() {
    var y = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    nav.style.setProperty('--progress', (docH > 0 ? (y / docH) * 100 : 0) + '%');
    nav.classList.toggle('is-stuck', y > 24);

    // 라이트 구간에 들어오면 내비를 라이트로 뒤집는다
    if (lightZone) {
      var top = lightZone.getBoundingClientRect().top;
      nav.classList.toggle('is-light', top <= 56);
    }

    // 활성 섹션
    var activeIdx = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= window.innerHeight * 0.4) activeIdx = i;
    }
    navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === activeIdx); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Core Loop: 스크롤에 따라 폰 화면 교체 ---------- */
  var steps = $$('.loop-step');
  var frames = $$('#loopPhone > [data-frame]');
  if (steps.length && frames.length) {
    var loopIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = steps.indexOf(e.target);
        if (idx < 0) return;
        steps.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
        frames.forEach(function (f, i) { f.classList.toggle('is-active', i === idx); });
      });
    }, { threshold: 0.5, rootMargin: '-20% 0px -30% 0px' });
    steps.forEach(function (s) { loopIO.observe(s); });
    steps[0].classList.add('is-active');
    frames[0].classList.add('is-active');
  }

  /* ---------- 스테이지 맵 (SVG) ----------
     _design_ref 에 스테이지 선택 화면 캡처가 없어, 앱의 노드 해금 구조를
     SVG 로 재현했다. */
  var mapSvg = $('#stagemap');
  if (mapSvg) {
    // viewBox 196x426 (폰 화면 393x852 의 1/2) 안에서 아래→위로 올라가는 지그재그
    var NODES = [
      { id: 1, x: 122, y: 372 }, { id: 2, x: 60,  y: 306 },
      { id: 3, x: 132, y: 240 }, { id: 4, x: 64,  y: 174 },
      { id: 5, x: 126, y: 108 }
    ];
    var unlocked = 1;   // 해금된 마지막 스테이지
    var current  = 1;   // 지금 선택된 스테이지
    var NS = 'http://www.w3.org/2000/svg';

    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }

    // 경로
    var paths = [];
    for (var i = 0; i < NODES.length - 1; i++) {
      var a = NODES[i], b = NODES[i + 1];
      var p = el('path', { class: 'stage-path', d: 'M' + a.x + ' ' + a.y + ' L' + b.x + ' ' + b.y });
      mapSvg.appendChild(p);
      paths.push(p);
    }

    // 노드
    var groups = NODES.map(function (n) {
      var g = el('g', { class: 'stage-node', tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', '스테이지 1-' + n.id);
      g.appendChild(el('circle', { class: 'stage-pulse', cx: n.x, cy: n.y, r: 17 }));
      g.appendChild(el('circle', { class: 'ring', cx: n.x, cy: n.y, r: 17 }));
      var t = el('text', { class: 'lbl', x: n.x, y: n.y });
      t.textContent = n.id;
      g.appendChild(t);
      mapSvg.appendChild(g);
      // 잠긴 노드는 무시. 이미 연 노드는 선택만, 최전선 노드를 다시 누르면 다음이 열린다.
      // 마지막까지 다 열고 한 번 더 누르면 처음으로 돌아간다.
      function pick() {
        if (n.id > unlocked) return;
        if (n.id === current && current === unlocked) {
          if (unlocked === NODES.length) { unlocked = 1; current = 1; }
          else { unlocked += 1; current = unlocked; }
        } else {
          current = n.id;
        }
        render();
      }
      g.addEventListener('click', pick);
      g.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); }
      });
      return g;
    });

    function render() {
      groups.forEach(function (g, i) {
        var id = NODES[i].id;
        g.classList.toggle('is-open', id <= unlocked && id !== current);
        g.classList.toggle('is-current', id === current);
        g.setAttribute('aria-disabled', id > unlocked ? 'true' : 'false');
      });
      paths.forEach(function (p, i) { p.classList.toggle('is-open', i + 1 < unlocked); });
    }
    render();
  }

  /* ---------- 랭킹 티어 스크러버 ---------- */
  var slider = $('#tierSlider');
  if (slider) {
    // 포스터가 명시한 건 양 끝(UNRANKED / SUPER CHALLENGER)뿐이다.
    // 중간 단계 이름과 누적 중량 값은 구간을 보여주기 위한 예시 — 화면에도 그렇게 밝혀 둔다.
    var TIERS = [
      { name: 'UNRANKED',          icon: '🐭', color: '#919EA5', vol: 0 },
      { name: 'BRONZE',            icon: '🥉', color: '#C88A5A', vol: 10000 },
      { name: 'SILVER',            icon: '🥈', color: '#B9C6CC', vol: 50000 },
      { name: 'GOLD',              icon: '🥇', color: '#EFC75E', vol: 150000 },
      { name: 'PLATINUM',          icon: '💠', color: '#5EEFD3', vol: 400000 },
      { name: 'DIAMOND',           icon: '💎', color: '#7FD4FF', vol: 800000 },
      { name: 'MASTER',            icon: '👑', color: '#C58AFF', vol: 1500000 },
      { name: 'SUPER CHALLENGER',  icon: '🔥', color: '#EF5E7A', vol: 3000000 }
    ];
    var medal = $('#tierMedal'), tname = $('#tierName'), tvol = $('#tierVolume');
    var ticks = $('#tierTicks');
    var panel = $('#tierPanel');

    TIERS.forEach(function () {
      var d = document.createElement('i');
      d.className = 'tier-tick';
      ticks.appendChild(d);
    });
    var tickEls = $$('.tier-tick', ticks);

    slider.max = String(TIERS.length - 1);
    function paint() {
      var t = TIERS[Number(slider.value)];
      medal.textContent = t.icon;
      tname.textContent = t.name;
      tvol.innerHTML = '누적 중량 <b>' + t.vol.toLocaleString('ko-KR') + '</b> kg';
      panel.style.setProperty('--tier-color', t.color);
      tickEls.forEach(function (d, i) { d.classList.toggle('is-on', i <= Number(slider.value)); });
    }
    slider.addEventListener('input', paint);
    paint();
  }

  /* ---------- 컬러 스와치 복사 ---------- */
  $$('.swatch').forEach(function (b) {
    b.addEventListener('click', function () {
      var hex = b.dataset.hex;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(
          function () { toast(hex + ' 복사됨'); },
          function () { toast(hex); }
        );
      } else {
        toast(hex);
      }
    });
  });

  /* ---------- 스크린 아카이브 필터 ---------- */
  var filters = $$('.filter');
  var shots = $$('.shot');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var key = f.dataset.filter;
      filters.forEach(function (x) { x.classList.toggle('is-active', x === f); });
      shots.forEach(function (s) {
        s.hidden = !(key === 'all' || s.dataset.group === key);
      });
    });
  });

  /* ---------- 라이트박스 ---------- */
  var lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbCap = $('#lightboxCap');
  var lastFocus = null;
  function openLb(src, cap) {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = cap;
    lbCap.textContent = cap;
    lb.classList.add('is-on');
    document.body.style.overflow = 'hidden';
    $('.lightbox-close').focus();
  }
  function closeLb() {
    lb.classList.remove('is-on');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  shots.forEach(function (s) {
    s.addEventListener('click', function () {
      openLb(s.dataset.full, s.dataset.cap);
    });
  });
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox-close')) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('is-on')) closeLb();
    });
  }

  /* ---------- 히어로 패럴랙스 ---------- */
  var heroRemi = $('.hero-remi');
  if (heroRemi && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      heroRemi.style.translate = (dx * -22) + 'px ' + (dy * -16) + 'px';
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { heroRemi.style.translate = ''; });
  }
})();
