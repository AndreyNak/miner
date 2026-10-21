 /* ============================= 8. ОТРИСОВКА ============================= */


let blockTextures;

// Текстуры блоков ("шум") рисуются один раз: 4 варианта на каждый тип блока
function createBlockTextures() {
  blockTextures = BLOCK_TYPES.map((type, typeIndex) => {
    if (!type) return null;
    return [0, 1, 2, 3].map(variant => {
    const tile = document.createElement('canvas');
    tile.width = tile.height = TILE_SIZE;
    const tileCtx = tile.getContext('2d');
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) {
        tileCtx.fillStyle = type.colors[Math.floor(pseudoRandom(typeIndex * 100 + variant * 31 + a * 7 + b * 13) * 4)];
        tileCtx.fillRect(a * 4, b * 4, 4, 4);
    }
    return tile;
    });
  });
}

function drawBar(x, y, width, height, fraction, color) {
    ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, width + 2, height + 2);
    ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, width * fraction), height);

}

// --- ДЮНЫ 

// настройки слоёв дюн: height — средняя высота над землёй, amp — размах волны, len — длина волны
const duneFar  = {height: 90, amp: 30, len: 140, offset: 0};
const duneMid  = {height: 55, amp: 26, len: 100, offset: 300};
const duneNear = {height: 25, amp: 18, len: 70,  offset: 700};

// кактусы ближнего слоя
const cacti = [
  {x: 120, h: 46}, {x: 410, h: 58}, {x: 690, h: 40}, {x: 960, h: 52}
];

function drawDunes() {
  drawDunesSky();
  // дальний слой — бледные
  drawDuneLayer(duneFar,  GROUND_Y, '#ecd9a6', '#f6e8c2');
  // средний слой
  drawDuneLayer(duneMid,  GROUND_Y, '#e0c07a', '#eed39a');
  // ближний слой — насыщенные
  drawDuneLayer(duneNear, GROUND_Y, '#cfa65c', '#e2bd78');
  drawCacti(cacti, GROUND_Y, '#4f8a3c');
  ctx.fillStyle = '#1a120b';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, WORLD_HEIGHT * TILE_SIZE - GROUND_Y);
}

function drawDunesSky() {
  // небо — градиент от голубого к тёплому у горизонта
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#7ec8e8');
  grad.addColorStop(0.7, '#d8ecee');
  grad.addColorStop(1, '#fbe9b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

  // солнце с ореолом
  const sx = CANVAS_WIDTH * 0.78, sy = 90;
  ctx.fillStyle = 'rgba(255, 240, 180, 0.35)';
  ctx.beginPath(); ctx.arc(sx, sy, 60, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill();
}

function drawDuneLayer(layer, baseY, sandColor, crestColor) {
  const step = 8;
  const points = [];

  for (let x = 0; x <= CANVAS_WIDTH + step; x += step) {
    const t = x + layer.offset;
    const y = baseY - layer.height
      - Math.sin(t / layer.len) * layer.amp
      - Math.sin(t / (layer.len * 0.47) + 1.3) * layer.amp * 0.4;
    points.push({x, y});
  }

  // тело дюны
  ctx.fillStyle = sandColor;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (const p of points) ctx.lineTo(p.x, p.y);
  ctx.lineTo(CANVAS_WIDTH + step, baseY);
  ctx.closePath();
  ctx.fill();

  // освещённый гребень — светлая полоса вдоль верхней кромки
  ctx.strokeStyle = crestColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const p of points) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function drawCacti(list, baseY, color) {
  ctx.fillStyle = color;
  for (const c of list) {
    if (c.x < -40 || c.x > CANVAS_WIDTH + 40) continue;
    const w = 8;
    // ствол
    ctx.fillRect(c.x, baseY - c.h, w, c.h);
    // левая ветка
    ctx.fillRect(c.x - 10, baseY - c.h * 0.6, 10, 6);
    ctx.fillRect(c.x - 10, baseY - c.h * 0.6 - 14, 6, 20);
    // правая ветка
    ctx.fillRect(c.x + w, baseY - c.h * 0.45, 10, 6);
    ctx.fillRect(c.x + w + 4, baseY - c.h * 0.45 - 12, 6, 18);
  }
}

// -- Долина слизней


 //  Облака
const clouds = [
  { x: 80,  y: 40, speed: 3,  scale: 1.0 },
  { x: 300, y: 70, speed: 6, scale: 0.7 },
  { x: 700, y: 30, speed: 2,  scale: 1.3 },
  { x: 20, y: 100, speed: 3, scale: 0.9 },
];

function drawSky() {
  // небо: градиент от насыщенного голубого к светлому у горизонта
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#4aa8f0');
  grad.addColorStop(0.6, '#8fd4ff');
  grad.addColorStop(1, '#dff4ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

  drawSun();

  // облака: мягкие, из нескольких кругов, с тенью снизу
  for (const cloud of clouds) {
    const s = cloud.scale;
    const x = cloud.x, y = cloud.y;
    const puffs = [
      {dx: 12 * s, dy: 4 * s,  r: 9 * s},
      {dx: 26 * s, dy: -2 * s, r: 12 * s},
      {dx: 42 * s, dy: 3 * s,  r: 10 * s},
      {dx: 54 * s, dy: 6 * s,  r: 7 * s}
    ];
    ctx.fillStyle = 'rgba(160, 200, 235, 0.45)';
    for (const p of puffs) {
      ctx.beginPath(); ctx.arc(x + p.dx, y + p.dy + 3 * s, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    for (const p of puffs) {
      ctx.beginPath(); ctx.arc(x + p.dx, y + p.dy, p.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawForest();

  // земля под лесом
  ctx.fillStyle = '#1a120b';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, WORLD_HEIGHT * TILE_SIZE - GROUND_Y);
}

function drawSun() {
  const sunX = CANVAS_WIDTH - 200;
  const sunY = 50;
  const r = 24;

  // широкое мягкое свечение
  const glow = ctx.createRadialGradient(sunX, sunY, r * 0.5, sunX, sunY, r * 3.2);
  glow.addColorStop(0, 'rgba(255, 243, 160, 0.55)');
  glow.addColorStop(1, 'rgba(255, 243, 160, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(sunX, sunY, r * 3.2, 0, Math.PI * 2); ctx.fill();

  // кольцо ореола
  ctx.fillStyle = 'rgba(255, 243, 160, 0.4)';
  ctx.beginPath(); ctx.arc(sunX, sunY, r + 8, 0, Math.PI * 2); ctx.fill();

  // ядро с градиентом
  const core = ctx.createRadialGradient(sunX - 6, sunY - 6, 2, sunX, sunY, r);
  core.addColorStop(0, '#fff3a0');
  core.addColorStop(1, '#ffd93b');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(sunX, sunY, r, 0, Math.PI * 2); ctx.fill();
}

function drawForest() {
  // дальние холмы и дальний слой деревьев — бледные
  drawForestHills(GROUND_Y, 40, 12, 150, 0,   '#a9dcae');
  drawTreeLayer(forestFar.trees,  GROUND_Y, '#6a4a2a', '#4ab14a');
  // ближние холмы и ближний слой — насыщенные
  drawForestHills(GROUND_Y, 18, 8,  90,  400, '#6fbf7a');
  drawTreeLayer(forestNear.trees, GROUND_Y, '#4a2a1a', 'rgb(46, 133, 71)');
}

// мягкие холмы за деревьями
function drawForestHills(baseY, height, amp, len, offset, color) {
  const step = 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= CANVAS_WIDTH + step; x += step) {
    const t = x + offset;
    const y = baseY - height
      - Math.sin(t / len) * amp
      - Math.sin(t / (len * 0.43) + 0.8) * amp * 0.35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_WIDTH + step, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawTreeLayer(trees, baseY, trunkColor, crownColor) {
  for (const tree of trees) {
    const x = tree.x;
    if (x < -60 || x > CANVAS_WIDTH + 60) continue;

    const trunkH = tree.trunkHeight;
    const trunkW = tree.trunkWidth;
    const r = tree.crownSize / 2;

    // ствол + тёмная теневая сторона
    ctx.fillStyle = trunkColor;
    ctx.fillRect(x, baseY - trunkH, trunkW, trunkH);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + trunkW * 0.6, baseY - trunkH, trunkW * 0.4, trunkH);

    const cx = x + trunkW / 2;
    const cy = baseY - trunkH - r * 0.5;

    // тень кроны: те же круги, сдвинутые вниз, дают тёмную кромку снизу
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath(); ctx.arc(cx,         cy + 3,           r,       0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - r * 0.6, cy + r * 0.3 + 3, r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.6, cy + r * 0.3 + 3, r * 0.7, 0, Math.PI * 2); ctx.fill();

    // основная крона — три круга
    ctx.fillStyle = crownColor;
    ctx.beginPath(); ctx.arc(cx,         cy,               r,       0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - r * 0.6, cy + r * 0.3,   r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.6, cy + r * 0.3,   r * 0.7, 0, Math.PI * 2); ctx.fill();

    // блик со стороны солнца (справа сверху)
    ctx.fillStyle = 'rgba(255, 255, 200, 0.18)';
    ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.3, r * 0.5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawTerrain(rowFrom, rowTo) {
  for (let row = rowFrom; row <= rowTo; row++)
    for (let col = 0; col < WORLD_WIDTH; col++) {
      const blockType = blocks[row][col], x = col * TILE_SIZE, y = row * TILE_SIZE;
      if (blockType) {
        ctx.drawImage(blockTextures[blockType][(col * 7 + row * 13) % 4], x, y);
        if (row === SURFACE_ROW) {
          let surface_color = current_biome === 'slime_valley' ? '#4caf50'  : '#ebc869'; // покрытие поверхности
          ctx.fillStyle = surface_color; ctx.fillRect(x, y, TILE_SIZE, 4);
        } 
        const maxDurability = BLOCK_TYPES[blockType].durability;
        if (blockDurability[row][col] < maxDurability) {                                              // трещины
          const damage = 1 - blockDurability[row][col] / maxDurability;
          ctx.fillStyle = 'rgba(0,0,0,' + (damage * 0.55) + ')';
          ctx.fillRect(x + 3, y + 3, 2, TILE_SIZE - 6); ctx.fillRect(x + 3, y + 8, TILE_SIZE - 6, 2); ctx.fillRect(x + 11, y + 4, 2, TILE_SIZE - 8);
        }
      } else if (row > SURFACE_ROW) {                                                                 // пустота (пещера, выкопанное)
        ctx.fillStyle = '#2a1d12'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#34261a'; ctx.fillRect(x + 4, y + 4, 4, 4); ctx.fillRect(x + 12, y + 11, 4, 4);
      }
    }
}

function drawBase() {
  ctx.fillStyle = '#b99560'; ctx.fillRect(BASE_LEFT, BASE_TOP + 22, BASE_WIDTH, BASE_HEIGHT - 22);                       // стены
  ctx.fillStyle = '#a33';                                          
  ctx.fillRect(BASE_LEFT - 8, BASE_TOP + 12, BASE_WIDTH + 16, 12);                                                        // крыша
  ctx.fillRect(BASE_LEFT - 8, BASE_TOP, BASE_WIDTH + 16, 12); 
  ctx.fillRect(BASE_LEFT + 8, BASE_TOP - 12, BASE_WIDTH - 16, 12);
  ctx.fillRect(BASE_LEFT + 24, BASE_TOP - 24, BASE_WIDTH - 48, 12);
  ctx.fillStyle = '#5a3a1e'; ctx.fillRect(BASE_CENTER_X - 12, GROUND_Y - 34, 24, 34);                                    // дверь
  ctx.fillStyle = '#ffd966'; ctx.fillRect(BASE_LEFT + 22, BASE_TOP + 50, 20, 16); ctx.fillRect(BASE_LEFT + BASE_WIDTH - 42, BASE_TOP + 50, 20, 16);   // окна
  if (baseState.turretLevel) {ctx.fillStyle = '#333'; ctx.fillRect(BASE_CENTER_X - 8, BASE_TOP - 34, 16, 10); ctx.fillStyle = '#ffe066'; ctx.fillRect(BASE_CENTER_X - 3, BASE_TOP - 38, 6, 6);}
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillText(Math.round(baseState.hp) + "/" + baseState.maxHp, BASE_CENTER_X, BASE_TOP - 30);
  drawBar(BASE_LEFT, BASE_TOP - 48, BASE_WIDTH, 6, baseState.hp / baseState.maxHp, '#e53935');
  if (isPlayerInBaseZone() && !isShopOpen) {
    ctx.fillStyle = '#000a'; ctx.fillRect(BASE_CENTER_X - 60, BASE_TOP - 80, 120, 20);
    ctx.fillStyle = '#f5c542'; ctx.fillText('B — магазин', BASE_CENTER_X, BASE_TOP - 66);
  }
}

function drawMinibase() {
  const wallTop = BASE_TOP + 22;
  const wallH   = BASE_HEIGHT - 22;
  const right   = BASE_LEFT + BASE_WIDTH;
   // стены: тёплое дерево
  ctx.fillStyle = '#b99560';
  ctx.fillRect(BASE_LEFT, wallTop, BASE_WIDTH, wallH);
  // светлая кромка слева и тёмная справа дают объём
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(BASE_LEFT, wallTop, 3, wallH);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(right - 3, wallTop, 3, wallH);

  // каменный фундамент
  ctx.fillStyle = '#7c7f86';
  ctx.fillRect(BASE_LEFT, GROUND_Y - 6, BASE_WIDTH, 6);

  // крыша: трапеция в пределах ширины базы
  ctx.fillStyle = '#a82626';
  ctx.beginPath();
  ctx.moveTo(BASE_LEFT, wallTop);
  ctx.lineTo(BASE_LEFT + 14, BASE_TOP);
  ctx.lineTo(right - 14, BASE_TOP);
  ctx.lineTo(right, wallTop);
  ctx.closePath();
  ctx.fill();
  // блик на коньке
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(BASE_LEFT + 14, BASE_TOP, BASE_WIDTH - 28, 2);
  // тень от крыши на стене
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(BASE_LEFT, wallTop, BASE_WIDTH, 4);

  // окна с тёплым светом, по обе стороны от двери
  const winY = wallTop + 12;
  for (const wx of [BASE_LEFT + BASE_WIDTH * 0.2, right - BASE_WIDTH * 0.2 - 16]) {
    ctx.fillStyle = '#5a3a1e';                       // рама
    ctx.fillRect(wx - 2, winY - 2, 20, 20);
    ctx.fillStyle = '#ffd77a';                       // стекло
    ctx.fillRect(wx, winY, 16, 16);
    ctx.fillStyle = '#5a3a1e';                       // переплёт
    ctx.fillRect(wx + 7, winY, 2, 16);
    ctx.fillRect(wx, winY + 7, 16, 2);
  }

  // дверь с аркой, рамой и ручкой
  ctx.fillStyle = '#3e2610';
  ctx.fillRect(BASE_CENTER_X - 14, GROUND_Y - 36, 28, 36);
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(BASE_CENTER_X - 12, GROUND_Y - 34, 24, 34);
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(BASE_CENTER_X + 5, GROUND_Y - 18, 3, 3);

  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillText(Math.round(miniBaseState.hp) + "/" + miniBaseState.maxHp, BASE_CENTER_X, BASE_TOP - 5);
  drawBar(BASE_LEFT, BASE_TOP -  25, BASE_WIDTH, 6, miniBaseState.hp / miniBaseState.maxHp, '#e53935');
  if (isPlayerInBaseZone() && !isShopOpen) {
    ctx.fillStyle = '#000a'; ctx.fillRect(BASE_CENTER_X - 60, BASE_TOP - 80, 120, 20);
    ctx.fillStyle = '#f5c542'; ctx.fillText('B — магазин', BASE_CENTER_X, BASE_TOP - 66);
  }
}

function drawBossSlime(boss) {
  const bodyColor = boss.hurtTimer > 0 ? '#fff' : boss.color;

  // Тень под телом
  ctx.fillStyle = boss.shadeColor;
  ctx.fillRect(boss.x - 40, boss.y - 40, 80, 40);

  // Верхняя «шапка» слайма (горка)
  ctx.fillStyle = bodyColor;
  ctx.fillRect(boss.x - 30, boss.y - 60, 60, 20);
  ctx.fillRect(boss.x - 40, boss.y - 40, 80, 30);

  // Блики на теле
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(boss.x - 28, boss.y - 55, 15, 12);
  ctx.fillRect(boss.x - 20, boss.y - 42, 8, 6);

  // Глаза (белки)
  ctx.fillStyle = '#fff';
  ctx.fillRect(boss.x - 20, boss.y - 45, 15, 15);
  ctx.fillRect(boss.x + 5,  boss.y - 45, 15, 15);

  // Зрачки
  ctx.fillStyle = '#000';
  ctx.fillRect(boss.x - 15, boss.y - 40, 5, 5);
  ctx.fillRect(boss.x + 10, boss.y - 40, 5, 5);

  // Рот (широкая ухмылка)
  ctx.fillStyle = '#000';
  ctx.fillRect(boss.x - 12, boss.y - 25, 24, 4);
  ctx.fillRect(boss.x - 16, boss.y - 28, 4, 3);
  ctx.fillRect(boss.x + 12, boss.y - 28, 4, 3);

  // Зубы (пара квадратиков)
  ctx.fillStyle = '#fff';
  ctx.fillRect(boss.x - 6, boss.y - 25, 4, 4);
  ctx.fillRect(boss.x + 2, boss.y - 25, 4, 4);
  drawBar(boss.x - 40, boss.y - 80, 80, 8, boss.hp / boss.maxHp, '#e53935');
}

function drawBat(enemy) {
  const bodyColor = enemy.hurtTimer > 0 ? '#fff' : '#2b2b40'; 
  const wingColor = enemy.hurtTimer > 0 ? '#fff' : '#1a1a26'; 

  const cx = enemy.x;
  const cy = enemy.y;
  const time = performance.now() / 1000;

  
  const flap = Math.sin(time * 15) * 3;
  const wingAngle = flap * (Math.PI / 4); 
  // --- 1. ЛЕВОЕ КРЫЛО ---
  ctx.save();
  ctx.translate(cx - 6, cy + 2);
  ctx.rotate(wingAngle);
  ctx.fillStyle = wingColor;
  ctx.fillRect(-4, -8, 4, 8);
  ctx.restore();

  // --- 2. ПРАВОЕ КРЫЛО ---
  ctx.save();
  ctx.translate(cx + 6, cy + 2);
  ctx.rotate(-wingAngle);
  ctx.fillStyle = wingColor;
  ctx.fillRect(0, -8, 4, 8); 
  ctx.restore();
  
  // уши
  ctx.fillStyle = bodyColor;
  ctx.fillRect(cx - 4, cy - 8, 2, 4);   
  ctx.fillRect(cx + 2, cy - 8, 2, 4);   

  // тело
  ctx.fillRect(cx - 4, cy - 4, 8, 4);   // Верхняя часть (голова/грудь)
  ctx.fillRect(cx - 6, cy, 12, 4);      // Нижняя часть (живот)

  // глаза
  ctx.fillStyle = '#ff0000'; 
  ctx.fillRect(cx - 3, cy - 3, 2, 2);   
  ctx.fillRect(cx + 1, cy - 3, 2, 2);  

  // лапы
  ctx.fillStyle = bodyColor;
  ctx.fillRect(cx - 4, cy + 4, 2, 2);   
  ctx.fillRect(cx + 2, cy + 4, 2, 2); 

  drawBar(cx - 8, cy - 14, 16, 2, enemy.hp / enemy.maxHp, '#e53935');
}

function drawSlime(enemy) {
  const bodyColor = enemy.hurtTimer > 0 ? '#fff' : enemy.color;
  const halfWidth = enemy.width / 2;
  const left = enemy.x - halfWidth;
  const top = enemy.y - enemy.height;
  const unitX = enemy.width / 16;
  const unitY = enemy.height / 12;   

  // тень (нижняя часть)
  ctx.fillStyle = enemy.shadeColor;
  ctx.fillRect(left, enemy.y - unitY * 8, enemy.width, unitY * 8);

  // тело: верхний выступ и основная часть
  ctx.fillStyle = bodyColor;
  ctx.fillRect(enemy.x - unitX * 6, top, unitX * 12, unitY * 4);
  ctx.fillRect(left, enemy.y - unitY * 8, enemy.width, unitY * 6);

  // глаза: белки
  ctx.fillStyle = '#fff';
  ctx.fillRect(enemy.x - unitX * 4, enemy.y - unitY * 9, unitX * 3, unitY * 3);
  ctx.fillRect(enemy.x + unitX,     enemy.y - unitY * 9, unitX * 3, unitY * 3);

  // глаза: зрачки
  ctx.fillStyle = '#000';
  ctx.fillRect(enemy.x - unitX * 3, enemy.y - unitY * 8, unitX, unitY);
  ctx.fillRect(enemy.x + unitX * 2, enemy.y - unitY * 8, unitX, unitY);

  // красный хелс-бар над врагом
  drawBar(left, top - 8, enemy.width, 3, enemy.hp / enemy.maxHp, '#e53935');
}

function drawEnemies() {
    for (const enemy of enemies) {
      if (enemy.isCaveSlime && !devModeEnabled) {                                   // пещерных слизней в тумане не видно
          const row = Math.floor((enemy.y - 5) / TILE_SIZE), col = Math.floor(enemy.x / TILE_SIZE);
          if (!explored[row] || !explored[row][col]) continue;
      }

      if (enemy.isBoss) { drawBossSlime(enemy); continue; }
      if (enemy.kind === 'bat') { drawBat(enemy); continue; }
      if (enemy.kind === 'slime') drawSlime(enemy);

    }
}

function drawChests() {
  const lidColor   = '#8a5a2a';   // крышка — светлое дерево
  const bodyColor  = '#6a3f18';   // корпус — тёмное дерево
  const metalColor = '#c9a227';   // металлические полосы и замок
  const outline    = '#3a2410';   // обводка (опционально)

  for (const chest of chests) {
    if (chest && !devModeEnabled) {                                   // сундуки в тумане не видно
        const row = Math.floor((chest.y - 5) / TILE_SIZE)
        const col = Math.floor(chest.x / TILE_SIZE);
        if (!explored[row] || !explored[row][col]) continue;
    }

    const y = chest.y - 6
    // === крышка (верхняя часть, чуть шире) ===
    ctx.fillStyle = lidColor;
    ctx.fillRect(chest.x - 9, y - 8, 18, 5);
     // === корпус (нижняя часть) ===
    ctx.fillStyle = bodyColor;
    ctx.fillRect(chest.x - 8, y - 3, 16, 9);

    // === металлические полосы по вертикали ===
    ctx.fillStyle = metalColor;
    ctx.fillRect(chest.x - 6, y - 8, 2, 14);   // левая
    ctx.fillRect(chest.x + 4, y - 8, 2, 14);   // правая

    // === замок по центру ===
    ctx.fillStyle = metalColor;
    ctx.fillRect(chest.x - 2, y - 4, 4, 4);
    ctx.fillStyle = outline;
    ctx.fillRect(chest.x - 1, y - 3, 2, 2);    // замочная скважина

    // === тень под сундуком (опционально) ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(chest.x - 9, y + 6, 18, 3);

     drawBar(chest.x - 8, chest.y - 20, 16, 3, chest.hp / chest.maxHp, '#e53935');      
  }
}

function drawTurretBeams() {
    ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2;
    for (const beam of turretBeams) {ctx.beginPath(); ctx.moveTo(beam.x1, beam.y1); ctx.lineTo(beam.x2, beam.y2); ctx.stroke();}
}

function drawPlayer() {
    const x = Math.round(player.x), y = Math.round(player.y);
    const moving = keysDown.KeyD || keysDown.KeyA
    moveSpeedRange = {
      95: 1,
      110: 1.2,
      130: 1.4,
      155: 1.6
    }
    
    let leg1 = 0;
    let leg2 = 0;

    if (moving) {
      const swing = Math.sin(performance.now() * (0.018 * moveSpeedRange[player.moveSpeed]));
      leg1 = Math.round(swing);
      leg2 = -leg1;
    }
    ctx.fillStyle = '#f1c27d'; ctx.fillRect(x + 2, y, 8, 7);                                  // голова
    ctx.fillStyle = '#f5c542'; ctx.fillRect(x + 1, y - 2, 10, 3);                             // каска
    ctx.fillStyle = '#000'; ctx.fillRect(x + (player.facing > 0 ? 7 : 3), y + 3, 1, 2);       // глаз
    ctx.fillStyle = '#2f6fcf'; ctx.fillRect(x + 1, y + 7, 10, 6);                             // тело
    ctx.fillStyle = '#3b3b4a'; ctx.fillRect(x + 2 + leg1, y + 13, 3, 5); ctx.fillRect(x + 7 + leg2, y + 13, 3, 5);   // ноги
    const held = getSelectedItem();
    if (held) {
      const weaponLength = held.kind === 'weapon' && held.index ? 12 : 9;
      ctx.fillStyle = getItemColor(held);
      if (player.swingAnimTimer > 0 && held.kind === 'weapon') ctx.fillRect(player.facing > 0 ? x + 10 : x - weaponLength + 2, y + 7, weaponLength, 3);
      else ctx.fillRect(player.facing > 0 ? x + 10 : x - 2, y + 1, 3, weaponLength);
    }
    if (player.oxygen < player.maxOxygen) {    
      drawBar(playerCenterX() - 14, playerCenterY() - 20, 30, 4, player.oxygen / player.maxOxygen, '#3385ff') // кислород над игроком
    }
}

function drawItemIcon(item, x, y) {
  ctx.fillStyle = getItemColor(item);
  if (item.kind === 'ladder') {
    ctx.fillRect(x + 12, y + 8, 4, 28); ctx.fillRect(x + 28, y + 8, 4, 28);                // рейки
    for (let rung = 0; rung < 4; rung++) ctx.fillRect(x + 12, y + 13 + rung * 7, 20, 3);   // перекладины
    return;
  }
  if (item.kind === 'dynamite') {
    ctx.fillRect(x + 16, y + 12, 12, 24);                                                   // шашка
    ctx.fillStyle = '#f2d9a0'; ctx.fillRect(x + 16, y + 21, 12, 4);                         // полоска
    ctx.fillStyle = '#6b3f20'; ctx.fillRect(x + 21, y + 6, 2, 6);                           // фитиль
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 20, y + 3, 4, 4);                           // искра
    return;
  }
  if (item.kind === 'bossSlime') {
    const cx = x + 22;  // центр ячейки по X (подставь свой размер / 2)
    const cy = y + 30;  // центр ячейки по Y

    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(cx - 4, cy - 16, 8, 3);   // пробка
    ctx.fillStyle = '#8a6a3a'; ctx.fillRect(cx - 5, cy - 13, 10, 2);  // горлышко
    ctx.fillStyle = '#c8e6c9'; ctx.fillRect(cx - 6, cy - 11, 12, 14); // стекло
    ctx.fillStyle = '#4caf50'; ctx.fillRect(cx - 5, cy - 6, 10, 8);   // слизь
    ctx.fillStyle = '#2e7d32'; ctx.fillRect(cx - 5, cy, 10, 2);       // тень слизи
    ctx.fillStyle = '#81c784'; ctx.fillRect(cx - 4, cy - 5, 3, 3);    // блик
    ctx.fillStyle = '#1b5e20'; ctx.fillRect(cx - 3, cy - 3, 2, 2);    // глаз 1
    ctx.fillStyle = '#1b5e20'; ctx.fillRect(cx + 1, cy - 3, 2, 2);    // глаз 2
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(cx - 1, cy - 21, 3, 3);   // искра
    ctx.fillStyle = '#fff59d'; ctx.fillRect(cx, cy - 20, 1, 1);       // ядро искры
    return;
  }
  if (item.kind === 'weapon' && item.family === 'melee' ) {
    ctx.fillRect(x + 20, y + 10, 5, 20);                           // лезвие
    ctx.fillStyle = '#6b3f20'; ctx.fillRect(x + 15, y + 30, 15, 4); ctx.fillRect(x + 20, y + 34, 5, 6);   // гарда и рукоять
  } else if (item.kind === 'weapon' && item.family === 'range') {
    ctx.fillStyle = '#d9a65a';

    // Дуга лука
    ctx.fillRect(x + 16, y + 10, 4, 3);
    ctx.fillRect(x + 20, y + 13, 3, 5);
    ctx.fillRect(x + 22, y + 18, 3, 10);
    ctx.fillRect(x + 20, y + 28, 3, 5);
    ctx.fillRect(x + 16, y + 33, 4, 3);

    // Тетива — тот же цвет
    ctx.fillStyle = '#f7f6f6';
    ctx.fillRect(x + 17, y + 13, 1, 20);

  }else {
    const isShovel = getItemData(item).family === 'shovel';
    ctx.fillRect(isShovel ? x + 14 : x + 9, y + 9, isShovel ? 16 : 26, 6);   // головка: у лопаты короче, у кирки длиннее
    ctx.fillStyle = '#6b3f20'; ctx.fillRect(x + 20, y + 15, 4, 24);          // ручка
  }
}

function drawInventoryBar() {
  const left = (CANVAS_WIDTH - (SLOT_COUNT * SLOT_SIZE + (SLOT_COUNT - 1) * SLOT_GAP)) / 2, top = CANVAS_HEIGHT - SLOT_SIZE - 10;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const x = left + i * (SLOT_SIZE + SLOT_GAP), isSelected = i === player.selectedSlot;
    ctx.fillStyle = isSelected ? 'rgba(245,197,66,.25)' : 'rgba(0,0,0,.55)'; ctx.fillRect(x, top, SLOT_SIZE, SLOT_SIZE);
    ctx.strokeStyle = isSelected ? '#f5c542' : '#5b6478'; ctx.lineWidth = isSelected ? 3 : 2; ctx.strokeRect(x + 1, top + 1, SLOT_SIZE - 2, SLOT_SIZE - 2);
    ctx.fillStyle = '#9aa3b5'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillText(i + 1, x + 4, top + 12);
    const item = player.inventory[i];
    if (item) {
      drawItemIcon(item, x, top);
      if (item.count) { ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'right'; ctx.fillText(item.count, x + SLOT_SIZE - 4, top + SLOT_SIZE - 5); }
    }
  }
  const held = getSelectedItem();
  if (held) { ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillText(getItemData(held).name, CANVAS_WIDTH / 2, top - 8); }
}

function drawLadders() {
  const firstRow = Math.max(0, Math.floor(cameraY / TILE_SIZE)), lastRow = Math.min(WORLD_HEIGHT - 1, Math.ceil((cameraY + CANVAS_HEIGHT) / TILE_SIZE));
  ctx.fillStyle = LADDER_ITEM.color;
  for (let row = firstRow; row <= lastRow; row++)
    for (let col = 0; col < WORLD_WIDTH; col++) {
      if (!ladders[row][col]) continue;
      const x = col * TILE_SIZE, y = row * TILE_SIZE;
      ctx.fillRect(x + 4, y, 3, TILE_SIZE); ctx.fillRect(x + 13, y, 3, TILE_SIZE);          // боковые рейки
      ctx.fillRect(x + 4, y + 3, 12, 2); ctx.fillRect(x + 4, y + 11, 12, 2);               // перекладины
    }
}

// Динамит мигает: свой цвет и белый (80% белизны), чем ближе взрыв, тем чаще
function drawDynamites() {
  for (const dynamite of dynamites) {
    const x = dynamite.col * TILE_SIZE, y = dynamite.row * TILE_SIZE;
    const elapsed = DYNAMITE_FUSE_SEC - dynamite.timer;
    const isFlashing = Math.floor(elapsed * (1.5 + 1.5 * elapsed) * 2) % 2 === 1;
    ctx.fillStyle = DYNAMITE_ITEM.color; ctx.fillRect(x + 6, y + 5, 8, 15);               // шашка
    ctx.fillStyle = '#f2d9a0'; ctx.fillRect(x + 6, y + 10, 8, 3);                         // полоска
    if (isFlashing) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x + 6, y + 5, 8, 15); }
    ctx.fillStyle = '#6b3f20'; ctx.fillRect(x + 9, y + 2, 2, 4);                          // фитиль
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 8, y, 4, 3);                              // искра
  }
}

function drawExplosions() {
  for (const explosion of explosions) {
    const progress = 1 - explosion.timer / EXPLOSION_ANIM_SEC;
    ctx.fillStyle = 'rgba(255,170,40,' + (0.6 * (1 - progress)) + ')';
    ctx.beginPath(); ctx.arc(explosion.x, explosion.y, explosion.radius * (0.4 + 0.6 * progress), 0, Math.PI * 2); ctx.fill();
  }
}

// Рамка в клетке, куда встанет лестница: зелёная — можно, красная — нельзя
function drawLadderPlacementPreview() {
  const held = getSelectedItem();
  if (!held || (held.kind !== 'ladder' && held.kind !== 'dynamite')) return;
  const col = Math.floor(mouse.x / TILE_SIZE), row = Math.floor((mouse.y + cameraY) / TILE_SIZE);
  if (col < 0 || col >= WORLD_WIDTH || row < 0 || row >= WORLD_HEIGHT || blocks[row][col]) return;
  if (held.kind === 'ladder' && ladders[row][col]) return;
  const reach = held.kind === 'ladder' ? LADDER_REACH_TILES : DYNAMITE_REACH_TILES;
  const distance = Math.hypot(col * TILE_SIZE + TILE_SIZE / 2 - playerCenterX(), row * TILE_SIZE + TILE_SIZE / 2 - playerCenterY());
  const canPlace = distance <= reach * TILE_SIZE + TILE_SIZE / 2 && (held.kind === 'dynamite' || hasLadderSupport(col, row));
  ctx.strokeStyle = canPlace ? '#7CFC8A' : '#ff6b6b'; ctx.lineWidth = 2;
  ctx.strokeRect(col * TILE_SIZE + 1, row * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
}

// Туман: неисследованное чёрное, далёкое исследованное затемнено
function drawFog(rowFrom, rowTo) {
    if (devModeEnabled) return;
    const cx = playerCenterX() / TILE_SIZE, cy = playerCenterY() / TILE_SIZE;
    for (let row = rowFrom; row <= rowTo; row++)
    for (let col = 0; col < WORLD_WIDTH; col++) {
        if (!explored[row][col]) {ctx.fillStyle = '#07070b'; ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);}
        else if (Math.hypot(col + 0.5 - cx, row + 0.5 - cy) > FOG_DIM_RADIUS) {ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);}
    }
}

// Рамка вокруг блока под курсором: белая — достаёт, красная — слишком далеко
function drawBlockHighlight() {
    const col = Math.floor(mouse.x / TILE_SIZE), row = Math.floor((mouse.y + cameraY) / TILE_SIZE);
    if (col < 0 || col >= WORLD_WIDTH || row < 0 || row >= WORLD_HEIGHT || !blocks[row][col] || (!explored[row][col] && !devModeEnabled)) return;
    const held = getSelectedItem();
    if (!held || held.kind !== 'tool') return;                      // рамка только когда в руке инструмент
    const tool = TOOLS[held.index];
    const distance = Math.hypot(col * TILE_SIZE + TILE_SIZE / 2 - playerCenterX(), row * TILE_SIZE + TILE_SIZE / 2 - playerCenterY());
    ctx.strokeStyle = distance <= tool.radiusTiles * TILE_SIZE + TILE_SIZE / 2 ? '#fff' : '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(col * TILE_SIZE + 1, row * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
}

function drawFloatingTexts() {
    ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    for (const text of floatingTexts) {ctx.fillStyle = text.color; ctx.fillText(text.text, text.x, text.y);}
}

// Элементы поверх экрана (не сдвигаются камерой)
function drawScreenOverlay() {
    drawInventoryBar();
    const depth = getDepthPlayer();
    ctx.textAlign = 'left'; ctx.font = '12px monospace';

    // FPS 
    ctx.fillStyle = '#000a'; ctx.fillRect(6, 6, 120, 20);
    ctx.fillStyle = fps >= 50 ? '#7CFC8A' : fps >= 30 ? '#f5c542' : '#ff6b6b';
    ctx.fillText('FPS: ' + fps, 12, 20);

    let currentY = 30; 
    const boxHeight = 20;
    const padding = 4; // Отступ между плашками

    // Глубина
    if (showDetecterDepth) {
      ctx.fillStyle = '#000a'; ctx.fillRect(6, currentY, 120, boxHeight);
      ctx.fillStyle = '#fff'; ctx.fillText('Глубина: ' + depth + ' бл.', 12, currentY + 14);
      
      currentY += boxHeight + padding; 
    }

    // Потребелние кислорода
    if (showOxygenCost) {
      const layer = BIOME_BLOCK_LAYERS[current_biome].find(layer => depth < layer.maxDepth);
      ctx.fillStyle = '#000a';ctx.fillRect(6, currentY, 120, boxHeight);
      ctx.fillStyle = '#fff';ctx.fillText('Пот. O²: ' + layer.oxygenCost + '/сек.', 12, currentY + 14);
      
      currentY += boxHeight + padding; 
    }


    ctx.textAlign = 'center';
    if (messageTimer > 0) {
        ctx.fillStyle = '#000a'; ctx.fillRect(100, 190, 760, 40);
        ctx.fillStyle = '#fff'; ctx.font = '36px monospace'; ctx.fillText(messageText, 480, 220);
    }
    if (isGameOver) {
        ctx.fillStyle = '#000c'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 36px monospace'; ctx.fillText('База разрушена', 480, 240);
        ctx.font = '16px monospace'; ctx.fillText('Волн начато: ' + waveNumber + ' · Нажми, чтобы начать заново', 480, 280);
    }
}

function drawOxygenZone() {
  if (!showOxygenZone) return;
  const safeDepth = (SURFACE_ROW + player.oxygenFreeDepth) * TILE_SIZE;

  ctx.beginPath();
  ctx.moveTo(0, safeDepth);
  ctx.lineTo(WORLD_WIDTH * TILE_SIZE, safeDepth);
  
  ctx.strokeStyle = '#02dff8'; 
  ctx.lineWidth = 3;

  ctx.stroke();
}

function drawOxygenPulse() {
  const ratio = player.oxygen / player.maxOxygen;
  if (ratio >= 0.25) return; // эффекта нет выше 25%

  // 0 при 25%, 1 при 0%
  const strength = 1 - ratio / 0.25;

  // медленная волна ~1.5 Гц: sin даёт -1..1, переводим в 0..1
  const wave = 0.5 + 0.5 * Math.sin(Date.now() / 300);

  // амплитуда затемнения: от 0 до 0.9 * strength
  const alpha = wave * strength * 0.9;

  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHitboxes() {
  if (!showHitboxes) return;
  ctx.lineWidth = 1;

  //  радиус оружия
  const cx = playerCenterX();
  const cy = playerCenterY();
  const attackRadius = WEAPONS[player.weaponIndex].radiusTiles * TILE_SIZE;

  ctx.beginPath();
  ctx.arc(cx, cy, attackRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 152, 0, 0.1)'; // Оранжевая полупрозрачная заливка
  ctx.fill();
  ctx.strokeStyle = '#ff9800'; // Оранжевая обводка
  ctx.stroke();

  // хитбоксы врагов
  for (const enemy of enemies) {
    const rect = getEnemyRect(enemy);

    ctx.fillStyle = 'rgba(255, 23, 68, 0.15)';
    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    ctx.strokeStyle = '#ff1744';
    ctx.strokeRect(rect.left + 0.5, rect.top + 0.5, rect.width - 1, rect.height - 1);

    // точка отсчёта врага (центр низа)
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(enemy.x - 2, enemy.y - 2, 4, 4);
  }

  // хитбоксы стрел: квадрат с учётом arrowSize = 8
  const arrowSize = 8;
  ctx.strokeStyle = '#00e5ff';
  for (const p of projectiles) {
    ctx.strokeRect(p.x - arrowSize + 0.5, p.y - arrowSize + 0.5, arrowSize * 2, arrowSize * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
  }
}

function drawProjectiles() {
  for (const arrow of projectiles) {
    ctx.save();
    
    // 1. Перемещаем холст в центр стрелы
    ctx.translate(arrow.x, arrow.y);
    
    // 2. Поворачиваем холст по направлению полета
    ctx.rotate(arrow.angle);

    // 3. Рисуем древко (линия от хвоста к носу)
    ctx.beginPath();
    ctx.moveTo(-10, 0);   // Хвост (сзади)
    ctx.lineTo(5, 0);     // Нос (впереди)
    ctx.strokeStyle = arrow.color; // '#4c301b' (дерево)
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Рисуем наконечник (треугольник на носу)
    ctx.beginPath();
    ctx.moveTo(5, 0);     // Острие
    ctx.lineTo(2, -3);    // Левый край наконечника
    ctx.lineTo(2, 3);     // Правый край наконечника
    ctx.closePath();
    ctx.fillStyle = '#888'; // Серый металл
    ctx.fill();

    // 5. (Опционально) Рисуем оперение на хвосте
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-12, -3);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-12, 3);
    ctx.closePath();
    ctx.fillStyle = '#eee'; // Белое оперение
    ctx.fill();

    // Возвращаем холст в исходное состояние (чтобы не сломать отрисовку других объектов)
    ctx.restore();
  }
}

function drawPhoneUpgrades() {
  for (const upgrade of phoneUpgrades) {
    const cx = upgrade.x;
    const cy = upgrade.y;

    const w = TILE_SIZE;
    const h = TILE_SIZE * 1.5;
    
    const left = cx - w / 2;
    const top = cy - h;

    ctx.fillStyle = '#000a';ctx.fillRect(left + 4, cy - 4, w - 8, 4);
    ctx.fillStyle = '#555';ctx.fillRect(left, cy - TILE_SIZE / 2, w, TILE_SIZE / 2);
    ctx.fillStyle = '#777';ctx.fillRect(left + 2, cy - TILE_SIZE / 2 + 2, w - 4, 4);

    const pedestalW = w * 0.6;
    const pedestalLeft = cx - pedestalW / 2;
    ctx.fillStyle = '#444';
    ctx.fillRect(pedestalLeft, top + TILE_SIZE / 2, pedestalW, TILE_SIZE / 2);


    let glowColor = '#0ff';
    if (upgrade.id === 'open_phone') glowColor = '#0f0'; // Зеленый (телефон)
    else if (upgrade.id === 'detecter_depth') glowColor = '#f0f'; // Фиолетовый (глубина)
    else if (upgrade.id === 'oxygen_zone') glowColor = '#0af'; // Синий (зона кислорода)
    else if (upgrade.id === 'oxygen_cost') glowColor = '#ff0'; // Желтый (потребление)

    const orbSize = TILE_SIZE * 0.4;
    const orbX = cx - orbSize / 2;
    const orbY = top + 8;

    ctx.fillStyle = glowColor + '44'; 
    ctx.fillRect(orbX - 2, orbY - 2, orbSize + 4, orbSize + 4);

    ctx.fillStyle = glowColor;
    ctx.fillRect(orbX, orbY, orbSize, orbSize);

    ctx.fillStyle = '#000';
    const iconSize = 4; 
    const iconX = cx - iconSize / 2;
    const iconY = orbY + orbSize / 2 - iconSize / 2;

    if (upgrade.id === 'detecter_depth') {
      ctx.fillRect(iconX, iconY - 2, 2, 6); 
      ctx.fillRect(iconX - 2, iconY + 2, 6, 2);
    } else if (upgrade.id === 'oxygen_zone') {
      ctx.fillRect(iconX, iconY, 2, 2);
    } else if (upgrade.id === 'open_phone') {
      ctx.fillRect(iconX - 2, iconY - 2, 6, 6);
      ctx.fillStyle = glowColor;
      ctx.fillRect(iconX - 1, iconY - 1, 4, 4);
    }
  }
}

function drawPhoneUpgradeUI() {
  const nearby = getNearbyPhoneUpgrade();
  
  if (nearby) {
    const textX = nearby.x;
    const textY = nearby.y - 40;

    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#000a';ctx.fillRect(textX - 60, textY - 14, 120, 20);
    ctx.fillStyle = '#f5c542';ctx.fillText('E — активировать', textX, textY);

    ctx.textAlign = 'left'; 
  }
}

function render() {
  ctx.save();
  ctx.translate(0, -Math.round(cameraY));                      // камера следует за игроком по вертикали
  current_biome === 'slime_valley' ? drawSky() : drawDunes();
  const rowFrom = Math.max(SURFACE_ROW, Math.floor(cameraY / TILE_SIZE));
  const rowTo = Math.min(WORLD_HEIGHT - 1, Math.ceil((cameraY + CANVAS_HEIGHT) / TILE_SIZE));

  drawTerrain(rowFrom, rowTo);
  drawLadders();
  drawDynamites();
  isMainBase ? drawBase() : drawMinibase();
  drawProjectiles();
  drawEnemies();
  drawHitboxes();
  drawPhoneUpgrades();
  drawChests();
  drawTurretBeams();
  drawPlayer();
  drawExplosions();
  drawFog(rowFrom, rowTo);
  drawOxygenZone();
  drawBlockHighlight();
  drawLadderPlacementPreview();
  drawPhoneUpgradeUI();
  drawFloatingTexts();
  ctx.restore();
  drawOxygenPulse();
  drawScreenOverlay();
}