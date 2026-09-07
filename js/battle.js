/* ============================================================
   SPOT ME — 배틀 데모
   앱의 핵심 루프(운동 세트 → 레미가 인식 → 몬스터 공격 → 보상)를
   브라우저에서 클릭으로 체험하게 만든 미니 데모.
   몬스터 스프라이트 4상태(idle / damage / lowhp / fainted)는
   frontend/assets/characters 원본을 그대로 쓴다.
   ============================================================ */
(function () {
  'use strict';

  var arena = document.getElementById('arena');
  if (!arena) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 앱에 실제로 등장하는 5종 몬스터 — 각각 운동을 방해하는 요인을 의인화한 것 */
  var MONSTERS = [
    { key: 'motivation', name: '동기 상실',  hp: 420,  loot: ['🧀 치즈 12', '⚡ 경험치 250', '🔧 부품 3'] },
    { key: 'record',     name: '기록 망각',  hp: 520,  loot: ['🧀 치즈 15', '⚡ 경험치 320', '🔧 부품 4'] },
    { key: 'routine',    name: '루틴 붕괴',  hp: 640,  loot: ['🧀 치즈 18', '⚡ 경험치 410', '🔧 부품 5'] },
    { key: 'fatigue',    name: '누적 피로',  hp: 780,  loot: ['🧀 치즈 22', '⚡ 경험치 530', '🔧 부품 6'] },
    { key: 'goal-loss',  name: '목표 상실',  hp: 950,  loot: ['🧀 치즈 30', '⚡ 경험치 700', '🔧 부품 8'] }
  ];

  /* 한 번의 클릭 = 운동 한 세트. 세트마다 문구가 바뀐다. */
  var SETS = [
    '벤치프레스 60kg × 10',
    '스쿼트 80kg × 8',
    '데드리프트 100kg × 5',
    '바벨로우 50kg × 12',
    '오버헤드프레스 40kg × 10',
    '레그프레스 120kg × 12'
  ];

  var stage      = document.getElementById('arenaStage');
  var monImg     = document.getElementById('monsterSprite');
  var monWrap    = document.getElementById('monsterFighter');
  var monName    = document.getElementById('monsterName');
  var remiImg    = document.getElementById('remiSprite');
  var hpFill     = document.getElementById('hpFill');
  var hpText     = document.getElementById('hpText');
  var hpName     = document.getElementById('hpName');
  var setText    = document.getElementById('setText');
  var victory    = document.getElementById('victory');
  var victoryLoot= document.getElementById('victoryLoot');
  var picker     = document.getElementById('monPicker');
  var resetBtn   = document.getElementById('battleReset');

  var cur, hp, maxHp, setIdx = 0, cleared = false, hitTimer = null;

  function sprite(key, state) {
    return 'assets/monsters/' + key + '-' + state + '.png';
  }

  /* ---------- 몬스터 선택 버튼 ---------- */
  MONSTERS.forEach(function (m, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mon-pick';
    b.title = m.name;
    b.setAttribute('aria-label', m.name + ' 선택');
    var img = document.createElement('img');
    img.src = sprite(m.key, 'idle');
    img.alt = '';
    img.loading = 'lazy';
    b.appendChild(img);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      load(i);
    });
    picker.appendChild(b);
  });
  var pickBtns = Array.prototype.slice.call(picker.children);

  /* ---------- 몬스터 로드 ---------- */
  function load(i) {
    cur = MONSTERS[i];
    maxHp = cur.hp;
    hp = maxHp;
    cleared = false;
    setIdx = 0;
    monImg.src = sprite(cur.key, 'idle');
    monImg.alt = cur.name;
    monName.textContent = cur.name;
    hpName.textContent = cur.name;
    monWrap.classList.remove('is-down');
    arena.classList.remove('is-cleared');
    victory.classList.remove('is-on');
    pickBtns.forEach(function (b, n) { b.classList.toggle('is-active', n === i); });
    paintHp();
    setText.textContent = '탭해서 세트를 기록하세요';
  }

  function paintHp() {
    var pct = Math.max(0, hp / maxHp) * 100;
    hpFill.style.width = pct + '%';
    hpFill.classList.toggle('is-low', pct <= 35);
    hpText.textContent = Math.max(0, Math.round(hp)).toLocaleString('ko-KR') +
                         ' / ' + maxHp.toLocaleString('ko-KR');
  }

  /* ---------- 데미지 숫자 ---------- */
  function popDamage(dmg, crit, x, y) {
    var s = document.createElement('span');
    s.className = 'dmg' + (crit ? ' is-crit' : '');
    s.textContent = (crit ? 'CRITICAL ' : '') + '-' + dmg;
    s.style.left = x + 'px';
    s.style.top  = y + 'px';
    stage.appendChild(s);
    setTimeout(function () { s.remove(); }, 900);
  }

  /* ---------- 공격 ---------- */
  function attack(ev) {
    if (cleared) { load(MONSTERS.indexOf(cur)); return; }

    var crit = Math.random() < 0.18;
    var base = Math.round(maxHp * (0.09 + Math.random() * 0.07));
    var dmg  = crit ? base * 2 : base;
    hp = Math.max(0, hp - dmg);

    // 데미지 숫자를 몬스터 위쪽에 띄운다
    var r = stage.getBoundingClientRect();
    var mr = monWrap.getBoundingClientRect();
    var x = mr.left - r.left + mr.width / 2;
    var y = mr.top - r.top + mr.height * 0.18;
    popDamage(dmg, crit, x, y);

    // 세트 기록 문구
    setText.textContent = SETS[setIdx % SETS.length] + ' 기록됨';
    setIdx++;

    paintHp();

    if (!reduceMotion) {
      arena.classList.add('is-attacking', 'is-shake');
      clearTimeout(hitTimer);
      hitTimer = setTimeout(function () { arena.classList.remove('is-attacking', 'is-shake'); }, 200);
    }

    // 스프라이트 상태 전환: 피격 → (체력 따라) 평상 / 빈사
    if (hp <= 0) {
      knockout();
    } else {
      monImg.src = sprite(cur.key, 'damage');
      var restState = (hp / maxHp) <= 0.35 ? 'lowhp' : 'idle';
      setTimeout(function () {
        if (!cleared) monImg.src = sprite(cur.key, restState);
      }, 220);
    }
  }

  function knockout() {
    cleared = true;
    monImg.src = sprite(cur.key, 'fainted');
    monWrap.classList.add('is-down');
    arena.classList.add('is-cleared');
    setText.textContent = '오늘의 운동 완료';

    victoryLoot.innerHTML = '';
    cur.loot.forEach(function (l) {
      var s = document.createElement('span');
      s.className = 'loot';
      s.textContent = l;
      victoryLoot.appendChild(s);
    });
    setTimeout(function () { victory.classList.add('is-on'); }, 420);
  }

  /* ---------- 이벤트 ---------- */
  stage.addEventListener('click', attack);
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); attack(e); }
  });
  victory.addEventListener('click', function (e) {
    e.stopPropagation();
    load(MONSTERS.indexOf(cur));
  });
  if (resetBtn) {
    resetBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      load(MONSTERS.indexOf(cur));
    });
  }

  load(0);
})();
