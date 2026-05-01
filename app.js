'use strict';

// ── State ──
const state = { worry: '', method: '' };

// ── Outcomes ──
const OUTCOMES = [
  { verdict: '해버려',         flavor: '이미 마음은 정했잖아. 눈치 보지 마.' },
  { verdict: '하지 마',        flavor: '지금 이 순간만큼은, 멈추는 게 맞다.' },
  { verdict: '당장 해',        flavor: '늦기 전에. 지금 이 순간이 가장 이른 때야.' },
  { verdict: '다시 생각해',    flavor: '우주가 아직 준비가 안 됐대. 조금만 기다려봐.' },
  { verdict: '타이밍 아님',    flavor: '분명히 더 좋은 때가 온다. 근거는 없음.' },
  { verdict: '어차피 할 거잖아', flavor: '여기까지 온 건 이미 결정했다는 뜻이야.' },
  { verdict: '자고 일어나서',  flavor: '모든 결정은 자고 나면 더 명확해진다.' },
  { verdict: '몸이 먼저 알아', flavor: '머리보다 몸을 믿어. 심장이 뭐라고 하지?' },
];

const METHOD_LABELS = {
  petal: '꽃잎 뽑기',
  roulette: '룰렛',
  dice: '주사위',
  card: '신탁 카드',
};

// ── Navigation ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Input Screen ──
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

document.getElementById('btn-back-to-input').addEventListener('click', () => showScreen('screen-input'));

// ── Method Selection ──
document.querySelectorAll('.method-card').forEach(card => {
  card.addEventListener('click', () => {
    state.method = card.dataset.method;
    setupInteraction(state.method);
    showScreen('screen-interact');
  });
});

// ── Result Actions ──
document.getElementById('btn-retry').addEventListener('click', () => {
  setupInteraction(state.method);
  showScreen('screen-interact');
});

document.getElementById('btn-new').addEventListener('click', () => {
  state.worry = '';
  state.method = '';
  worryInput.value = '';
  charCount.textContent = '0 / 200';
  btnGo.disabled = true;
  showScreen('screen-input');
});

document.getElementById('btn-share').addEventListener('click', () => {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).catch(() => {});
  }
  showToast('링크가 클립보드에 복사됐어요');
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => { t.hidden = true; }, 2400);
}

// ── Show Result ──
function showResult(outcomeIndex) {
  const idx = outcomeIndex !== undefined
    ? Math.max(0, Math.min(OUTCOMES.length - 1, outcomeIndex))
    : Math.floor(Math.random() * OUTCOMES.length);
  const o = OUTCOMES[idx];

  document.getElementById('result-worry-display').textContent = `"${state.worry}"`;
  document.getElementById('result-verdict-text').textContent = o.verdict;
  document.getElementById('result-flavor-text').textContent = o.flavor;
  document.getElementById('result-method-tag').textContent = `via ${METHOD_LABELS[state.method]}`;

  const now = new Date();
  document.getElementById('result-date').textContent =
    `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  showScreen('screen-result');
}

// ── Interaction Router ──
function setupInteraction(method) {
  const container = document.getElementById('interact-container');
  container.innerHTML = '';
  ({ petal: setupPetal, roulette: setupRoulette, dice: setupDice, card: setupCard }[method])(container);
}

// ─────────────────────────────────────────
// PETAL PICKING
// ─────────────────────────────────────────
function setupPetal(container) {
  const PETAL_COUNT = 10;
  // Alternate "해" / "말아" starting randomly
  let cur = Math.random() > 0.5 ? 0 : 1;
  const labels = Array.from({ length: PETAL_COUNT }, () => { const l = cur; cur ^= 1; return l === 0 ? '해' : '말아'; });

  container.innerHTML = `
    <div class="interact-nav"><button class="btn-text" id="petal-back">← 방법 바꾸기</button></div>
    <div class="interact-header">
      <p class="interact-title">꽃잎을 하나씩 뽑아봐</p>
      <p class="interact-hint hint-pulse" id="petal-hint">꽃잎을 터치해서 뜯어내세요</p>
    </div>
    <div class="flower-wrap">
      <div class="petal-origin" id="petal-origin"></div>
      <div class="flower-center" id="flower-center">?</div>
    </div>
  `;

  document.getElementById('petal-back').addEventListener('click', () => showScreen('screen-method'));

  const origin      = document.getElementById('petal-origin');
  const centerEl    = document.getElementById('flower-center');
  const hintEl      = document.getElementById('petal-hint');
  let remaining = PETAL_COUNT;
  let done = false;

  labels.forEach((label, i) => {
    const angle = (360 / PETAL_COUNT) * i;
    const petal = document.createElement('div');
    petal.className = `petal ${label === '해' ? 'do' : 'dont'}`;
    petal.style.transform = `rotate(${angle}deg)`;

    const span = document.createElement('span');
    span.className = 'petal-label';
    span.textContent = label;
    petal.appendChild(span);

    petal.addEventListener('click', () => {
      if (petal.classList.contains('plucked') || done) return;
      petal.classList.add('plucked');
      remaining--;

      centerEl.textContent = label;
      centerEl.className = `flower-center${remaining === 0 ? ' answer' : ''}`;
      hintEl.classList.remove('hint-pulse');
      hintEl.textContent = `남은 꽃잎: ${remaining}장`;

      if (remaining === 0) {
        done = true;
        const positive = label === '해';
        const pool = positive ? [0, 2, 5] : [1, 3, 4];
        const idx = pool[Math.floor(Math.random() * pool.length)];
        setTimeout(() => showResult(idx), 900);
      }
    });

    origin.appendChild(petal);
  });
}

// ─────────────────────────────────────────
// ROULETTE
// ─────────────────────────────────────────
function setupRoulette(container) {
  container.innerHTML = `
    <div class="interact-nav"><button class="btn-text" id="roulette-back">← 방법 바꾸기</button></div>
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

  document.getElementById('roulette-back').addEventListener('click', () => showScreen('screen-method'));

  const canvas  = document.getElementById('roulette-canvas');
  const ctx     = canvas.getContext('2d');
  const N       = OUTCOMES.length;
  const SEG     = (2 * Math.PI) / N;
  const CX = 140, CY = 140, R = 128;
  let angle     = 0;
  let spinning  = false;

  // Two alternating grays for segments
  const fillA = '#f2f2f2', fillB = '#e4e4e4';

  function draw(a) {
    ctx.clearRect(0, 0, 280, 280);

    for (let i = 0; i < N; i++) {
      const s = a + i * SEG, e = s + SEG;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, s, e);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? fillA : fillB;
      ctx.fill();
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(s + SEG / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#222';
      const txt = OUTCOMES[i].verdict;
      ctx.font = `${txt.length > 5 ? 600 : 700} ${txt.length > 5 ? 10 : 12}px system-ui`;
      ctx.fillText(txt, R - 10, 4);
      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(CX, CY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  draw(0);

  document.getElementById('btn-spin').addEventListener('click', () => {
    if (spinning) return;
    spinning = true;

    const extraRad = (5 + Math.random() * 4) * 2 * Math.PI;
    const target   = angle + extraRad;
    const dur      = 3200;
    const t0       = performance.now();
    const a0       = angle;

    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4); // ease-out quartic
      angle = a0 + (target - a0) * e;
      draw(angle);

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        spinning = false;
        // Pointer is at top = -π/2 in canvas coords
        // Find which segment the pointer falls on
        const norm    = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointer = (3 * Math.PI / 2 - norm + 2 * Math.PI) % (2 * Math.PI);
        const idx     = Math.floor(pointer / SEG) % N;
        setTimeout(() => showResult(idx), 480);
      }
    }
    requestAnimationFrame(step);
  });
}

// ─────────────────────────────────────────
// DICE
// ─────────────────────────────────────────
function setupDice(container) {
  // dot grid positions [row, col] in a 3x3 grid
  const DOTS = {
    1: [[1,1]],
    2: [[0,0],[2,2]],
    3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[0,2],[2,0],[2,2]],
    5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
  };

  // Cube rotation to bring each face (1-6) toward viewer
  // face-front=1 (no rot), face-back=2 (Y180), face-right=3 (Y-90),
  // face-left=4 (Y90),  face-top=5 (X-90),  face-bottom=6 (X90)
  const FACE_ROT = [
    { x: 0,   y: 0   }, // face 1
    { x: 0,   y: 180 }, // face 2
    { x: 0,   y: -90 }, // face 3
    { x: 0,   y: 90  }, // face 4
    { x: -90, y: 0   }, // face 5
    { x: 90,  y: 0   }, // face 6
  ];

  // Map dice result (0-5 = face 1-6) to outcome index
  const OUTCOME_MAP = [0, 1, 2, 3, 4, 5]; // face 1→outcome 0, face 2→1 ...

  container.innerHTML = `
    <div class="interact-nav"><button class="btn-text" id="dice-back">← 방법 바꾸기</button></div>
    <div class="interact-header">
      <p class="interact-title">주사위를 던져봐</p>
      <p class="interact-hint">신성한 주사위가 운명을 결정한다</p>
    </div>
    <div class="dice-scene">
      <div class="dice-cube" id="dice-cube">
        <div class="dice-face face-front"></div>
        <div class="dice-face face-back"></div>
        <div class="dice-face face-right"></div>
        <div class="dice-face face-left"></div>
        <div class="dice-face face-top"></div>
        <div class="dice-face face-bottom"></div>
      </div>
    </div>
    <div class="dice-btn-wrap">
      <button class="btn btn-primary" id="btn-roll">던지기 <span class="btn-arrow">→</span></button>
    </div>
  `;

  document.getElementById('dice-back').addEventListener('click', () => showScreen('screen-method'));

  const cube = document.getElementById('dice-cube');
  const faces = cube.querySelectorAll('.dice-face');

  // Build dot faces
  faces.forEach((face, i) => {
    const num = i + 1;
    const pattern = DOTS[num];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'width:14px;height:14px;display:flex;align-items:center;justify-content:center;';
        if (pattern.some(([pr,pc]) => pr === r && pc === c)) {
          const dot = document.createElement('div');
          dot.className = 'dot';
          cell.appendChild(dot);
        }
        face.appendChild(cell);
      }
    }
  });

  let cumX = -20, cumY = 25; // initial "resting" tilt
  let rolling = false;

  document.getElementById('btn-roll').addEventListener('click', () => {
    if (rolling) return;
    rolling = true;

    const faceIdx = Math.floor(Math.random() * 6);
    const { x: fx, y: fy } = FACE_ROT[faceIdx];

    const effX = ((cumX % 360) + 360) % 360;
    const effY = ((cumY % 360) + 360) % 360;

    const spins = 5;
    cumX += spins * 360 + ((fx - effX + 360) % 360);
    cumY += spins * 360 + ((fy - effY + 360) % 360);

    cube.style.transition = 'transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)';
    cube.style.transform  = `rotateX(${cumX}deg) rotateY(${cumY}deg)`;

    setTimeout(() => {
      rolling = false;
      showResult(OUTCOME_MAP[faceIdx]);
    }, 2000);
  });
}

// ─────────────────────────────────────────
// ORACLE CARDS
// ─────────────────────────────────────────
function setupCard(container) {
  // Build 9 cards from shuffled outcomes (some repeated if needed)
  const indices = [];
  while (indices.length < 9) {
    const shuffled = [...Array(OUTCOMES.length).keys()].sort(() => Math.random() - 0.5);
    indices.push(...shuffled);
  }
  const cardIndices = indices.slice(0, 9);

  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX'];

  container.innerHTML = `
    <div class="interact-nav"><button class="btn-text" id="card-back">← 방법 바꾸기</button></div>
    <div class="interact-header">
      <p class="interact-title">카드를 하나 골라봐</p>
      <p class="interact-hint hint-pulse">직감을 믿어. 끌리는 카드를 선택해.</p>
    </div>
    <div class="cards-grid" id="cards-grid"></div>
  `;

  document.getElementById('card-back').addEventListener('click', () => showScreen('screen-method'));

  const grid = document.getElementById('cards-grid');
  const cardEls = [];

  cardIndices.forEach((outcomeIdx, i) => {
    const card = document.createElement('div');
    card.className = 'oracle-card';
    card.innerHTML = `
      <div class="oracle-card-inner">
        <div class="oracle-card-front">
          <span class="oracle-card-front-label">${ROMAN[i]}</span>
        </div>
        <div class="oracle-card-back">
          <span class="oracle-verdict">${OUTCOMES[outcomeIdx].verdict}</span>
        </div>
      </div>
    `;

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
