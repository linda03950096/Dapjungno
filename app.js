'use strict';

// ── State ──
const HISTORY_KEY = 'dapjungno-result-history';
const MAX_HISTORY = 30;

const state = {
  worry: '',
  method: '',
  fortuneTest: '',
  history: loadHistory(),
};

// ── Decision Outcomes ──
const OUTCOMES = [
  { verdict: '해버려',           flavor: '이미 마음은 정했잖아. 눈치 보지 마.' },
  { verdict: '하지 마',          flavor: '지금 이 순간만큼은, 멈추는 게 맞다.' },
  { verdict: '당장 해',          flavor: '늦기 전에. 지금 이 순간이 가장 이른 때야.' },
  { verdict: '다시 생각해',      flavor: '우주가 아직 준비가 안 됐대. 조금만 기다려봐.' },
  { verdict: '타이밍 아님',      flavor: '분명히 더 좋은 때가 온다. 근거는 없음.' },
  { verdict: '어차피 할 거잖아', flavor: '여기까지 온 건 이미 결정했다는 뜻이야.' },
  { verdict: '자고 일어나서',    flavor: '모든 결정은 자고 나면 더 명확해진다.' },
  { verdict: '몸이 먼저 알아',   flavor: '머리보다 몸을 믿어. 심장이 뭐라고 하지?' },
];

const METHOD_LABELS = { petal: '꽃잎 뽑기', roulette: '룰렛', dice: '주사위', card: '신탁 카드' };

// ── Fortune Outcomes ──
const TOILET_OUTCOMES = [
  { squares: 0,  label: '0칸 남음',        verdict: '운 0점',        flavor: '오늘 당신의 운은 휴지 0칸입니다. 외출 전에 확인하세요. 진심으로.' },
  { squares: 1,  label: '1칸 남음',        verdict: '불길한 하루',    flavor: '1칸이 남았습니다. 뭔가 하나는 꼬입니다. 마음의 준비를.' },
  { squares: 3,  label: '3칸 남음',        verdict: '평범한 하루',    flavor: '3칸. 그럭저럭 살아집니다. 기대는 하지 마세요.' },
  { squares: 5,  label: '5칸 남음',        verdict: '꽤 좋은 운',     flavor: '5칸이나 남았습니다. 오늘은 잘 될 수도 있어요. 아마도.' },
  { squares: 99, label: '새 롤 교체 직전', verdict: '대길 (大吉)',    flavor: '새 롤 교체 직전 상태. 오늘은 뭘 해도 됩니다. 진심입니다.' },
];

const EGG_OUTCOMES = [
  { type: 'broken',  label: '노른자 파열',      verdict: '예상 외 변수',   flavor: '노른자 터졌습니다. 계획 수정하세요.' },
  { type: 'twin',    label: '쌍란 발견',        verdict: '대박 운',        flavor: '쌍란 등장. 오늘은 나대도 됩니다.' },
  { type: 'perfect', label: '완벽한 써니사이드업', verdict: '안정적인 행운', flavor: '완벽한 써니사이드업. 오늘 하루는 완전합니다.' },
  { type: 'spread',  label: '흰자 산란',        verdict: '집중력 부족',    flavor: '흰자가 사방으로 퍼졌습니다. 정신 좀 차리세요.' },
  { type: 'shell',   label: '껍질 침입',        verdict: '짜증 주의',      flavor: '껍질 조각이 들어갔습니다. 오늘 하루 조심하세요.' },
];

const CLOVER_OUTCOMES = [
  { leaves: 3,  label: '세잎 클로버',   verdict: '보통의 운',        flavor: '세잎 클로버. 흔합니다. 그냥 하루입니다.' },
  { leaves: 4,  label: '네잎 클로버',   verdict: '매우 좋은 운',     flavor: '네잎 클로버 발견. 행운이 따릅니다. 오늘은 과감하게.' },
  { leaves: 5,  label: '다섯잎 클로버', verdict: '초대박 운',         flavor: '다섯잎 클로버. 희귀합니다. 오늘 인생 한 번 걸어보세요.' },
  { leaves: -1, label: '시든 클로버',   verdict: '컨디션 관리 필요', flavor: '시든 클로버 발견. 조용히 지내세요.' },
  { leaves: 0,  label: '줄기만 남음',   verdict: '아무 기대 말 것',  flavor: '줄기만 남았습니다. 오늘은 그냥 집에 계세요.' },
];

// ── Screen Navigation ──
const NAV_CONFIG = {
  'screen-landing':        { title: '답정너.',           back: null,                   dark: true  },
  'screen-fortune-select': { title: '오늘의 운 테스트',   back: 'screen-landing',       dark: true  },
  'screen-input':          { title: '결정 받기',          back: 'screen-landing',       dark: true  },
  'screen-method':         { title: '방법 선택',          back: 'screen-input',         dark: true  },
  'screen-interact':       { title: '',                  back: 'screen-method',        dark: true  },
  'screen-result':         { title: '운명의 답변',        back: 'screen-landing',       dark: true  },
  'screen-history':        { title: '결과 모아보기',      back: 'screen-landing',       dark: true  },
  'screen-toilet':         { title: '화장실 휴지 운',     back: 'screen-fortune-select', dark: true },
  'screen-egg':            { title: '계란 운 테스트',     back: 'screen-fortune-select', dark: true },
  'screen-clover':         { title: '클로버 운 테스트',   back: 'screen-fortune-select', dark: true },
  'screen-foresult':       { title: '오늘의 운',          back: 'screen-fortune-select', dark: true },
};

const appBack   = document.getElementById('app-back');
const appTitle  = document.getElementById('app-title');
const bottomNav = document.getElementById('bottom-nav');
const bottomNavItems = {
  'screen-landing': document.getElementById('nav-feed'),
  'screen-input': document.getElementById('nav-decide'),
  'screen-fortune-select': document.getElementById('nav-fortune'),
  'screen-history': document.getElementById('nav-history'),
};
const TOP_LEVEL_SCREENS = new Set(Object.keys(bottomNavItems));

function showScreen(id, titleOverride) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);

  const cfg = NAV_CONFIG[id] || {};
  appTitle.textContent = titleOverride || cfg.title || '답정너.';
  if (cfg.back) {
    appBack.hidden = false;
    appBack.onclick = () => showScreen(cfg.back);
  } else {
    appBack.hidden = true;
    appBack.onclick = null;
  }
  bottomNav.hidden = !TOP_LEVEL_SCREENS.has(id);
  Object.values(bottomNavItems).forEach(item => item.classList.remove('active'));
  if (bottomNavItems[id]) bottomNavItems[id].classList.add('active');
  document.body.classList.toggle('dark-ui', !!cfg.dark);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => { t.hidden = true; }, 2400);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function timeStr() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}

function addHistoryItem(item) {
  state.history = [{
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: todayStr(),
    time: timeStr(),
    ...item,
  }, ...state.history].slice(0, MAX_HISTORY);
  saveHistory();

  if (document.getElementById('screen-history').classList.contains('active')) {
    renderHistory();
  }
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const count = document.getElementById('history-count');

  list.innerHTML = '';
  count.textContent = state.history.length
    ? `최근 ${state.history.length}개의 결과를 모아봤어요.`
    : '확인한 결과가 여기에 쌓입니다.';
  empty.hidden = state.history.length > 0;

  state.history.forEach(item => {
    const card = document.createElement('article');
    card.className = `history-card history-card-${item.kind}`;

    const meta = document.createElement('div');
    meta.className = 'history-meta';

    const type = document.createElement('span');
    type.textContent = item.kind === 'fortune' ? item.testName : item.methodName;

    const date = document.createElement('span');
    date.textContent = `${item.date} ${item.time}`;

    const verdict = document.createElement('strong');
    verdict.className = 'history-verdict';
    verdict.textContent = item.verdict;

    const subject = document.createElement('p');
    subject.className = 'history-subject';
    subject.textContent = item.subject;

    const flavor = document.createElement('p');
    flavor.className = 'history-flavor';
    flavor.textContent = item.flavor;

    meta.append(type, date);
    card.append(meta, verdict, subject, flavor);
    list.appendChild(card);
  });
}

// ── Init ──
showScreen('screen-landing');

// ── Landing: Choice buttons ──
document.getElementById('btn-to-decision').addEventListener('click', () => showScreen('screen-input'));
document.getElementById('btn-to-fortune-select').addEventListener('click', () => showScreen('screen-fortune-select'));
document.getElementById('btn-to-quick-oracle').addEventListener('click', () => {
  state.worry = '지금 이 순간';
  state.method = 'card';
  showScreen('screen-interact', '신탁 카드');
  setupInteraction('card');
});

// ── Bottom Nav ──
document.getElementById('nav-feed').addEventListener('click', () => showScreen('screen-landing'));
document.getElementById('nav-decide').addEventListener('click', () => showScreen('screen-input'));
document.getElementById('nav-fortune').addEventListener('click', () => showScreen('screen-fortune-select'));
document.getElementById('nav-history').addEventListener('click', () => {
  renderHistory();
  showScreen('screen-history');
});

// ── Fortune Select: test cards ──
document.querySelectorAll('.fortune-choice').forEach(card => {
  card.addEventListener('click', () => {
    state.fortuneTest = card.dataset.test;
    resetFortune(card.dataset.test);
    showScreen(`screen-${card.dataset.test}`);
  });
});

// ── Fortune Result Actions ──
document.getElementById('btn-fore-retry').addEventListener('click', () => {
  resetFortune(state.fortuneTest);
  showScreen(`screen-${state.fortuneTest}`);
});
document.getElementById('btn-fore-other').addEventListener('click', () => showScreen('screen-fortune-select'));
document.getElementById('btn-fore-home').addEventListener('click', () => showScreen('screen-landing'));

function showFortuneResult(testName, subtitle, verdict, flavor) {
  document.getElementById('fore-test-name').textContent = testName;
  document.getElementById('fore-subtitle').textContent = subtitle;
  document.getElementById('fore-verdict').textContent = verdict;
  document.getElementById('fore-flavor').textContent = flavor;
  document.getElementById('fore-date').textContent = todayStr();
  addHistoryItem({
    kind: 'fortune',
    testName,
    subject: subtitle,
    verdict,
    flavor,
  });
  showScreen('screen-foresult');
}

function resetFortune(test) {
  if (test === 'toilet') resetToilet();
  else if (test === 'egg') resetEgg();
  else if (test === 'clover') resetClover();
}

// ══════════════════════════════
// TOILET PAPER TEST
// ══════════════════════════════
function resetToilet() {
  const roll  = document.getElementById('tp-roll');
  const strip = document.getElementById('tp-strip');
  const hint  = document.getElementById('toilet-hint');
  roll.classList.remove('spinning');
  strip.innerHTML = '';
  hint.textContent = '휴지 롤을 당겨보세요';
  hint.classList.add('hint-pulse');
  roll.onclick = null;
  roll.addEventListener('click', startToilet, { once: true });
}

function startToilet() {
  const roll  = document.getElementById('tp-roll');
  const strip = document.getElementById('tp-strip');
  const hint  = document.getElementById('toilet-hint');

  roll.classList.add('spinning');
  hint.classList.remove('hint-pulse');
  hint.textContent = '운명이 풀리는 중...';

  const outcome = TOILET_OUTCOMES[Math.floor(Math.random() * TOILET_OUTCOMES.length)];

  setTimeout(() => {
    roll.classList.remove('spinning');
    const count = outcome.squares === 99 ? 7 : outcome.squares;

    const labelEl = document.createElement('p');
    labelEl.className = 'tp-label';
    labelEl.textContent = outcome.label;
    strip.appendChild(labelEl);

    for (let i = 0; i < count; i++) {
      const sq = document.createElement('div');
      sq.className = 'tp-square';
      sq.style.animationDelay = `${i * 0.1}s`;
      strip.appendChild(sq);
    }

    hint.textContent = `오늘 당신의 운은 휴지 ${outcome.label}입니다.`;

    setTimeout(() => {
      showFortuneResult('화장실 휴지 운', outcome.label, outcome.verdict, outcome.flavor);
    }, count * 100 + 3000);
  }, 1400);
}

// ══════════════════════════════
// EGG TEST
// ══════════════════════════════
function resetEgg() {
  const eggWrap  = document.getElementById('egg-wrap');
  const panSurface = document.getElementById('pan-surface');
  const hint     = document.getElementById('egg-hint');
  const eggShell = document.getElementById('egg-shell');

  eggShell.classList.remove('falling');
  eggWrap.style.visibility = 'visible';
  panSurface.innerHTML = '';
  hint.textContent = '계란을 눌러서 깨보세요';
  hint.classList.add('hint-pulse');
  eggShell.onclick = null;
  eggShell.addEventListener('click', startEgg, { once: true });
}

function startEgg() {
  const eggShell   = document.getElementById('egg-shell');
  const eggWrap    = document.getElementById('egg-wrap');
  const panSurface = document.getElementById('pan-surface');
  const hint       = document.getElementById('egg-hint');

  const outcome = EGG_OUTCOMES[Math.floor(Math.random() * EGG_OUTCOMES.length)];
  hint.classList.remove('hint-pulse');
  hint.textContent = '깨지는 중...';

  eggShell.classList.add('falling');

  setTimeout(() => {
    eggWrap.style.visibility = 'hidden';
    renderEggResult(panSurface, outcome.type);
    hint.textContent = `${outcome.label} — ${outcome.verdict}`;

    setTimeout(() => {
      showFortuneResult('계란 운 테스트', outcome.label, outcome.verdict, outcome.flavor);
    }, 3200);
  }, 560);
}

function renderEggResult(surface, type) {
  const w  = surface.offsetWidth || 200;
  const h  = surface.offsetHeight || 100;
  const cx = w / 2, cy = h / 2;

  surface.innerHTML = '';

  const makeEl = (tag, styles) => {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    surface.appendChild(el);
    return el;
  };

  const white = (left, top, width, height, rx = '50%') => {
    const el = makeEl('div', { position:'absolute', left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px`, background:'rgba(252,250,245,0.96)', borderRadius: rx });
    el.className = 'egg-white';
    return el;
  };

  const yolk = (left, top, size) => {
    const el = makeEl('div', { position:'absolute', left:`${left}px`, top:`${top}px`, width:`${size}px`, height:`${size}px`, borderRadius:'50%', background:'radial-gradient(circle at 35% 30%, #ffe566, #f5a020)', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' });
    el.className = 'egg-yolk';
    return el;
  };

  if (type === 'perfect') {
    white(cx - 42, cy - 30, 84, 60);
    yolk(cx - 16, cy - 16, 32);
  } else if (type === 'twin') {
    white(cx - 50, cy - 28, 100, 56);
    yolk(cx - 38, cy - 14, 28);
    yolk(cx + 10, cy - 14, 28);
  } else if (type === 'broken') {
    const burst = makeEl('div', { position:'absolute', left:`${cx-44}px`, top:`${cy-24}px`, width:'88px', height:'48px', background:'rgba(245,160,32,0.45)', borderRadius:'40% 60% 60% 40% / 60% 40% 60% 40%' });
    burst.className = 'egg-yolk-burst';
    white(cx - 38, cy - 22, 76, 44);
    yolk(cx - 12, cy - 10, 24);
  } else if (type === 'spread') {
    white(cx - 58, cy - 22, 116, 44, '30% 70% 70% 30% / 70% 30% 70% 30%');
    yolk(cx + 12, cy - 12, 24);
  } else if (type === 'shell') {
    white(cx - 40, cy - 28, 80, 56);
    yolk(cx - 14, cy - 14, 28);
    makeEl('div', { position:'absolute', left:`${cx + 18}px`, top:`${cy - 22}px`, width:'10px', height:'7px', background:'#f0ebe3', borderRadius:'2px', transform:'rotate(28deg)' }).className = 'egg-shell-frag';
  }
}

// ══════════════════════════════
// CLOVER TEST
// ══════════════════════════════
function resetClover() {
  const field  = document.getElementById('grass-field');
  const reveal = document.getElementById('clover-reveal');
  const hint   = document.getElementById('clover-hint');

  field.classList.remove('shaking');
  reveal.classList.remove('visible');
  reveal.innerHTML = '';
  hint.textContent = '풀숲을 눌러보세요';
  hint.classList.add('hint-pulse');
  field.onclick = null;
  field.addEventListener('click', startClover, { once: true });
}

function startClover() {
  const field  = document.getElementById('grass-field');
  const reveal = document.getElementById('clover-reveal');
  const hint   = document.getElementById('clover-hint');

  const outcome = CLOVER_OUTCOMES[Math.floor(Math.random() * CLOVER_OUTCOMES.length)];
  hint.classList.remove('hint-pulse');
  hint.textContent = '풀숲을 헤치는 중...';

  field.classList.add('shaking');

  setTimeout(() => {
    reveal.innerHTML = buildCloverSVG(outcome.leaves);
    reveal.classList.add('visible');
    hint.textContent = `${outcome.label} 발견`;
  }, 600);

  setTimeout(() => {
    showFortuneResult('클로버 운 테스트', outcome.label, outcome.verdict, outcome.flavor);
  }, 3800);
}

function buildCloverSVG(leaves) {
  const ns  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '120');
  svg.setAttribute('viewBox', '0 0 100 120');

  const make = (tag, attrs) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  svg.appendChild(make('path', { d: 'M50 110 Q53 85 50 65', stroke: '#4a8040', 'stroke-width': '3.5', fill: 'none', 'stroke-linecap': 'round' }));

  if (leaves === -1) {
    const wiltColor = '#7a9a70';
    svg.appendChild(make('ellipse', { cx: '50', cy: '40', rx: '18', ry: '13', fill: wiltColor, transform: 'rotate(-20,50,40)' }));
    svg.appendChild(make('ellipse', { cx: '32', cy: '56', rx: '18', ry: '12', fill: wiltColor, transform: 'rotate(20,32,56)' }));
    svg.appendChild(make('ellipse', { cx: '68', cy: '56', rx: '18', ry: '12', fill: wiltColor, transform: 'rotate(-20,68,56)' }));
  } else if (leaves > 0) {
    const colors = { 3: '#4aaa40', 4: '#38b030', 5: '#28c024' };
    const color  = colors[leaves] || '#4aaa40';
    const radius = leaves === 5 ? 16 : 18;
    const dist   = leaves === 5 ? 20 : 22;

    for (let i = 0; i < leaves; i++) {
      const angleDeg = (360 / leaves) * i - 90;
      const rad = angleDeg * Math.PI / 180;
      const cx  = 50 + dist * Math.cos(rad);
      const cy  = 55 + dist * Math.sin(rad);
      svg.appendChild(make('ellipse', {
        cx: String(cx), cy: String(cy),
        rx: String(radius), ry: String(radius * 0.78),
        fill: color,
        transform: `rotate(${angleDeg + 90},${cx},${cy})`,
        opacity: leaves === 5 ? '0.92' : '1',
      }));
    }
    svg.appendChild(make('circle', { cx: '50', cy: '55', r: '6', fill: color, opacity: '0.7' }));
  }

  return svg.outerHTML;
}

// ══════════════════════════════
// DECISION FLOW
// ══════════════════════════════
const worryInput = document.getElementById('worry-input');
const btnGo      = document.getElementById('btn-go');
const charCount  = document.getElementById('char-count');

worryInput.addEventListener('input', () => {
  const len = worryInput.value.length;
  charCount.textContent = `${len} / 200`;
  btnGo.disabled = len === 0;
});

btnGo.addEventListener('click', () => {
  const text = worryInput.value.trim();
  if (!text) return;
  state.worry = text;
  const chip = document.getElementById('worry-chip');
  chip.textContent = `"${text.length > 40 ? text.slice(0, 40) + '…' : text}"`;
  showScreen('screen-method');
});

document.querySelectorAll('.method-feed-card').forEach(card => {
  card.addEventListener('click', () => {
    state.method = card.dataset.method;
    showScreen('screen-interact', METHOD_LABELS[state.method]);
    setupInteraction(state.method);
  });
});

document.getElementById('btn-retry').addEventListener('click', () => {
  showScreen('screen-interact', METHOD_LABELS[state.method]);
  setupInteraction(state.method);
});
document.getElementById('btn-new').addEventListener('click', () => {
  state.worry = '';
  state.method = '';
  worryInput.value = '';
  charCount.textContent = '0 / 200';
  btnGo.disabled = true;
  showScreen('screen-landing');
});
document.getElementById('btn-share').addEventListener('click', () => {
  if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(() => {});
  showToast('링크가 클립보드에 복사됐어요');
});

function showResult(outcomeIndex) {
  const idx = outcomeIndex !== undefined
    ? Math.max(0, Math.min(OUTCOMES.length - 1, outcomeIndex))
    : Math.floor(Math.random() * OUTCOMES.length);
  const o = OUTCOMES[idx];
  document.getElementById('result-worry-display').textContent = `"${state.worry}"`;
  document.getElementById('result-verdict-text').textContent  = o.verdict;
  document.getElementById('result-flavor-text').textContent   = o.flavor;
  document.getElementById('result-method-tag').textContent    = `via ${METHOD_LABELS[state.method]}`;
  document.getElementById('result-date').textContent          = todayStr();
  addHistoryItem({
    kind: 'decision',
    methodName: METHOD_LABELS[state.method],
    subject: state.worry,
    verdict: o.verdict,
    flavor: o.flavor,
  });
  showScreen('screen-result');
}

// ── Interaction Router ──
function setupInteraction(method) {
  const container = document.getElementById('interact-container');
  container.innerHTML = '';
  ({ petal: setupPetal, roulette: setupRoulette, dice: setupDice, card: setupCard }[method])(container);
}

// ── Petal ──
function setupPetal(container) {
  const PETAL_COUNT = 8 + Math.floor(Math.random() * 9);
  let clickCount = Math.random() > 0.5 ? 0 : 1;

  container.innerHTML = `
    <div class="interact-header">
      <p class="interact-title">꽃잎을 하나씩 뽑아봐</p>
      <p class="interact-hint hint-pulse" id="petal-hint">꽃잎을 터치해서 뜯어내세요</p>
    </div>
    <div class="flower-wrap">
      <div class="petal-origin" id="petal-origin"></div>
      <div class="flower-center" id="flower-center">?</div>
    </div>
  `;

  const origin   = document.getElementById('petal-origin');
  const centerEl = document.getElementById('flower-center');
  const hintEl   = document.getElementById('petal-hint');
  let remaining = PETAL_COUNT;
  let done = false;

  Array.from({ length: PETAL_COUNT }).forEach((_, i) => {
    const angle = (360 / PETAL_COUNT) * i;
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.transform = `rotate(${angle}deg)`;

    const span = document.createElement('span');
    span.className = 'petal-label';
    petal.appendChild(span);

    petal.addEventListener('click', () => {
      if (petal.classList.contains('plucked') || done) return;
      const label = clickCount % 2 === 0 ? '해' : '말아';
      clickCount++;

      petal.classList.add('plucked', label === '해' ? 'do' : 'dont');
      remaining--;

      centerEl.textContent = label;
      centerEl.className = `flower-center${remaining === 0 ? ' answer' : ''}`;
      hintEl.classList.remove('hint-pulse');
      hintEl.textContent = `남은 꽃잎: ${remaining}장`;

      if (remaining === 0) {
        done = true;
        const positive = label === '해';
        const pool = positive ? [0, 2, 5] : [1, 3, 4];
        setTimeout(() => showResult(pool[Math.floor(Math.random() * pool.length)]), 900);
      }
    });

    origin.appendChild(petal);
  });
}

// ── Roulette ──
function setupRoulette(container) {
  container.innerHTML = `
    <div class="interact-header">
      <p class="interact-title">운명의 바퀴를 돌려</p>
      <p class="interact-hint">버튼 한 번에 인생이 바뀝니다 (아마도)</p>
    </div>
    <div class="roulette-wrap">
      <div class="roulette-pointer"></div>
      <canvas id="roulette-canvas" width="280" height="280"></canvas>
    </div>
    <div class="roulette-btn-wrap">
      <button class="btn btn-primary" id="btn-spin">돌려 <span class="btn-arrow">→</span></button>
    </div>
  `;

  const canvas = document.getElementById('roulette-canvas');
  const ctx    = canvas.getContext('2d');
  const N = OUTCOMES.length, SEG = (2 * Math.PI) / N;
  const CX = 140, CY = 140, R = 128;
  let angle = 0, spinning = false;

  function draw(a) {
    ctx.clearRect(0, 0, 280, 280);
    for (let i = 0; i < N; i++) {
      const s = a + i * SEG, e = s + SEG;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R, s, e); ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#f2f2f2' : '#e4e4e4'; ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.stroke();
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(s + SEG / 2); ctx.textAlign = 'right';
      ctx.fillStyle = '#222';
      const txt = OUTCOMES[i].verdict;
      ctx.font = `${txt.length > 5 ? 600 : 700} ${txt.length > 5 ? 10 : 12}px system-ui`;
      ctx.fillText(txt, R - 10, 4); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 2 * Math.PI); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY, 20, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.stroke();
  }
  draw(0);

  document.getElementById('btn-spin').addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    const target = angle + (5 + Math.random() * 4) * 2 * Math.PI;
    const dur = 3200, t0 = performance.now(), a0 = angle;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      angle = a0 + (target - a0) * e; draw(angle);
      if (p < 1) { requestAnimationFrame(step); return; }
      spinning = false;
      const norm = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const idx  = Math.floor(((3 * Math.PI / 2 - norm + 2 * Math.PI) % (2 * Math.PI)) / SEG) % N;
      setTimeout(() => showResult(idx), 480);
    })(t0);
  });
}

// ── Dice ──
function setupDice(container) {
  const DOTS     = { 1:[[1,1]], 2:[[0,0],[2,2]], 3:[[0,0],[1,1],[2,2]], 4:[[0,0],[0,2],[2,0],[2,2]], 5:[[0,0],[0,2],[1,1],[2,0],[2,2]], 6:[[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]] };
  const FACE_ROT = [{ x:0,y:0 },{ x:0,y:180 },{ x:0,y:-90 },{ x:0,y:90 },{ x:-90,y:0 },{ x:90,y:0 }];

  container.innerHTML = `
    <div class="interact-header">
      <p class="interact-title">주사위를 던져봐</p>
      <p class="interact-hint">신성한 주사위가 운명을 결정한다</p>
    </div>
    <div class="dice-scene">
      <div class="dice-cube" id="dice-cube">
        <div class="dice-face face-front"></div><div class="dice-face face-back"></div>
        <div class="dice-face face-right"></div><div class="dice-face face-left"></div>
        <div class="dice-face face-top"></div><div class="dice-face face-bottom"></div>
      </div>
    </div>
    <div class="dice-btn-wrap">
      <button class="btn btn-primary" id="btn-roll">던지기 <span class="btn-arrow">→</span></button>
    </div>
  `;

  const cube = document.getElementById('dice-cube');
  cube.querySelectorAll('.dice-face').forEach((face, i) => {
    face.innerHTML = '';
    const pattern = DOTS[i + 1];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'width:14px;height:14px;display:flex;align-items:center;justify-content:center;';
        if (pattern.some(([r, c]) => r === row && c === col)) {
          const dot = document.createElement('div'); dot.className = 'dot'; cell.appendChild(dot);
        }
        face.appendChild(cell);
      }
    }
  });

  let cumX = -20, cumY = 25, rolling = false;

  document.getElementById('btn-roll').addEventListener('click', () => {
    if (rolling) return;
    rolling = true;
    const fi = Math.floor(Math.random() * 6);
    const { x: fx, y: fy } = FACE_ROT[fi];
    const effX = ((cumX % 360) + 360) % 360, effY = ((cumY % 360) + 360) % 360;
    cumX += 5 * 360 + ((fx - effX + 360) % 360);
    cumY += 5 * 360 + ((fy - effY + 360) % 360);
    cube.style.transition = 'transform 1.6s cubic-bezier(0.22,1,0.36,1)';
    cube.style.transform  = `rotateX(${cumX}deg) rotateY(${cumY}deg)`;
    setTimeout(() => { rolling = false; showResult(fi); }, 2000);
  });
}

// ── Oracle Card ──
function setupCard(container) {
  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX'];
  const indices = [];
  while (indices.length < 9) indices.push(...[...Array(OUTCOMES.length).keys()].sort(() => Math.random() - 0.5));
  const cardIndices = indices.slice(0, 9);

  container.innerHTML = `
    <div class="interact-header">
      <p class="interact-title">카드를 하나 골라봐</p>
      <p class="interact-hint hint-pulse">직감을 믿어. 끌리는 카드를 선택해.</p>
    </div>
    <div class="cards-grid" id="cards-grid"></div>
  `;

  const grid    = document.getElementById('cards-grid');
  const cardEls = [];

  cardIndices.forEach((outcomeIdx, i) => {
    const card = document.createElement('div');
    card.className = 'oracle-card';
    card.innerHTML = `
      <div class="oracle-card-inner">
        <div class="oracle-card-front"><span class="oracle-card-front-label">${ROMAN[i]}</span></div>
        <div class="oracle-card-back"><span class="oracle-verdict">${OUTCOMES[outcomeIdx].verdict}</span></div>
      </div>`;
    card.addEventListener('click', () => {
      if (card.classList.contains('flipped') || card.classList.contains('faded')) return;
      card.classList.add('flipped');
      cardEls.forEach(c => { if (c !== card) c.classList.add('faded'); });
      setTimeout(() => showResult(outcomeIdx), 900);
    });
    grid.appendChild(card);
    cardEls.push(card);
  });
}
