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

function drawSky() {
    ctx.fillStyle = '#6ec6ff'; ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    ctx.fillStyle = '#8fd4ff'; ctx.fillRect(0, GROUND_Y - 120, CANVAS_WIDTH, 120);
    ctx.fillStyle = '#fff';
    [[80, 40], [300, 70], [700, 30], [860, 90]].forEach(([x, y]) => {ctx.fillRect(x, y, 60, 12); ctx.fillRect(x + 12, y - 8, 36, 8);});
    ctx.fillStyle = '#1a120b'; ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, WORLD_HEIGHT * TILE_SIZE - GROUND_Y);
}

function drawTerrain(rowFrom, rowTo) {
    for (let row = rowFrom; row <= rowTo; row++)
    for (let col = 0; col < WORLD_WIDTH; col++) {
        const blockType = blocks[row][col], x = col * TILE_SIZE, y = row * TILE_SIZE;
        if (blockType) {
        ctx.drawImage(blockTextures[blockType][(col * 7 + row * 13) % 4], x, y);
        if (row === SURFACE_ROW) {ctx.fillStyle = '#4caf50'; ctx.fillRect(x, y, TILE_SIZE, 4);}      // трава
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
    ctx.fillText(baseState.hp + "/" + baseState.maxHp, BASE_CENTER_X, BASE_TOP - 30);
    drawBar(BASE_LEFT, BASE_TOP - 48, BASE_WIDTH, 6, baseState.hp / baseState.maxHp, '#e53935');
    if (isPlayerInBaseZone() && !isShopOpen) {
    ctx.fillStyle = '#000a'; ctx.fillRect(BASE_CENTER_X - 60, BASE_TOP - 80, 120, 20);
    ctx.fillStyle = '#f5c542'; ctx.fillText('B — магазин', BASE_CENTER_X, BASE_TOP - 66);
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
    if (enemy.isCaveSlime && !devModeEnabled) {                                   // пещерных слизней в тумане не видно
        const row = Math.floor((enemy.y - 5) / TILE_SIZE), col = Math.floor(enemy.x / TILE_SIZE);
        if (!explored[row] || !explored[row][col]) continue;
    }

    const bodyColor = enemy.hurtTimer > 0 ? '#fff' : enemy.color;

    ctx.fillStyle = enemy.shadeColor; ctx.fillRect(enemy.x - 8, enemy.y - 8, 16, 8);
    ctx.fillStyle = bodyColor; ctx.fillRect(enemy.x - 6, enemy.y - 12, 12, 4); ctx.fillRect(enemy.x - 8, enemy.y - 8, 16, 6);
    ctx.fillStyle = '#fff'; ctx.fillRect(enemy.x - 4, enemy.y - 9, 3, 3); ctx.fillRect(enemy.x + 1, enemy.y - 9, 3, 3);
    ctx.fillStyle = '#000'; ctx.fillRect(enemy.x - 3, enemy.y - 8, 1, 1); ctx.fillRect(enemy.x + 2, enemy.y - 8, 1, 1);
    drawBar(enemy.x - 8, enemy.y - 20, 16, 3, enemy.hp / enemy.maxHp, '#e53935');          // красный хелс-бар над врагом
    }
}

function drawTurretBeams() {
    ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2;
    for (const beam of turretBeams) {ctx.beginPath(); ctx.moveTo(beam.x1, beam.y1); ctx.lineTo(beam.x2, beam.y2); ctx.stroke();}
}

function drawPlayer() {
    const x = Math.round(player.x), y = Math.round(player.y);
    ctx.fillStyle = '#f1c27d'; ctx.fillRect(x + 2, y, 8, 7);                                  // голова
    ctx.fillStyle = '#f5c542'; ctx.fillRect(x + 1, y - 2, 10, 3);                             // каска
    ctx.fillStyle = '#000'; ctx.fillRect(x + (player.facing > 0 ? 7 : 3), y + 3, 1, 2);       // глаз
    ctx.fillStyle = '#2f6fcf'; ctx.fillRect(x + 1, y + 7, 10, 6);                             // тело
    ctx.fillStyle = '#3b3b4a'; ctx.fillRect(x + 2, y + 13, 3, 5); ctx.fillRect(x + 7, y + 13, 3, 5);   // ноги
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
  if (item.kind === 'weapon') {
    ctx.fillRect(x + 20, y + 10, 5, 20);                           // лезвие
    ctx.fillStyle = '#6b3f20'; ctx.fillRect(x + 15, y + 30, 15, 4); ctx.fillRect(x + 20, y + 34, 5, 6);   // гарда и рукоять
  } else {
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
      if (item.kind === 'ladder') { ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'right'; ctx.fillText(item.count, x + SLOT_SIZE - 4, top + SLOT_SIZE - 5); }
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

// Рамка в клетке, куда встанет лестница: зелёная — можно, красная — нельзя
function drawLadderPlacementPreview() {
  const held = getSelectedItem();
  if (!held || held.kind !== 'ladder') return;
  const col = Math.floor(mouse.x / TILE_SIZE), row = Math.floor((mouse.y + cameraY) / TILE_SIZE);
  if (col < 0 || col >= WORLD_WIDTH || row < 0 || row >= WORLD_HEIGHT || blocks[row][col] || ladders[row][col]) return;
  const distance = Math.hypot(col * TILE_SIZE + TILE_SIZE / 2 - playerCenterX(), row * TILE_SIZE + TILE_SIZE / 2 - playerCenterY());
  const canPlace = distance <= LADDER_REACH_TILES * TILE_SIZE + TILE_SIZE / 2 && hasLadderSupport(col, row);
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
    const depth = Math.max(0, Math.floor((player.y + player.height - GROUND_Y) / TILE_SIZE));
    ctx.textAlign = 'left'; ctx.font = '12px monospace';
    ctx.fillStyle = '#000a'; ctx.fillRect(6, 6, 110, 20);
    ctx.fillStyle = '#fff'; ctx.fillText('Глубина: ' + depth + ' бл.', 12, 20);
    ctx.fillStyle = '#000a'; ctx.fillRect(6, 30, 110, 20);
    ctx.fillStyle = fps >= 50 ? '#7CFC8A' : fps >= 30 ? '#f5c542' : '#ff6b6b';   // зелёный, жёлтый или красный в зависимости от FPS
    ctx.fillText('FPS: ' + fps, 12, 44);
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

function render() {
    ctx.save();
    ctx.translate(0, -Math.round(cameraY));                      // камера следует за игроком по вертикали
    drawSky();
    const rowFrom = Math.max(SURFACE_ROW, Math.floor(cameraY / TILE_SIZE));
    const rowTo = Math.min(WORLD_HEIGHT - 1, Math.ceil((cameraY + CANVAS_HEIGHT) / TILE_SIZE));
    drawTerrain(rowFrom, rowTo);
    drawLadders();
    drawBase();
    drawEnemies();
    drawTurretBeams();
    drawPlayer();
    drawFog(rowFrom, rowTo);
    drawBlockHighlight();
    drawLadderPlacementPreview();
    drawFloatingTexts();
    ctx.restore();
    drawOxygenPulse();
    drawScreenOverlay();
}