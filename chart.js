const INCOME_SAMPLE_INTERVAL_SEC = 5 // как часто записываем точку графика
const INCOME_WINDOW_SEC = 60;           // доход считается за последнюю минуту

const CHART_MAX_COMPRESSED_SEC = 40 * 60;   // плотность графика не выше, чем при 40 минутах игры
const CHART_GROUP_DISTANCE_PX = 28;         // покупки ближе этого расстояния склеиваются в одну точку

const chartOverlay = document.getElementById('chartOverlay');
let isChartOpen = false;
const chartCanvas = document.getElementById('incomeChart');


let gameTimeSec = 0, totalEarnedPoints = 0, incomeSampleTimer = 0;
let incomeSamples = [];   // точки графика: { time, earned, rate }
let purchaseLog = [];     // покупки: { time, name }
let chartScrollX = 0;                       // сдвиг графика по горизонтали (пиксели)
let isChartDragging = false, chartDragStartX = 0, chartDragStartScroll = 0, chartDragDistance = 0;
let chartHoverX = -1, chartHoverY = -1;     // положение курсора для подсказки
let chartHitAreas = [];                     // точки на экране для подсказки


// Все начисления очков идут через эту функцию, чтобы считать заработок (траты и потери при смерти не учитываются)
function earnPoints(amount) { points += amount; totalEarnedPoints += amount; }

function resetIncomeStats() {
    gameTimeSec = 0; totalEarnedPoints = 0; incomeSampleTimer = 0;
    incomeSamples = [{ time: 0, earned: 0, rate: 0 }];
    purchaseLog = [];
    drawIncomeChart();
}

function logWaveCleared(wave) {
    recordIncomeSample();
    purchaseLog.push({ time: gameTimeSec, name: 'Волна ' + wave, color: '#ff5555' });
    drawIncomeChart();
}

// Записывает точку: доход в минуту за последние INCOME_WINDOW_SEC секунд
function recordIncomeSample() {
    const windowStart = gameTimeSec - INCOME_WINDOW_SEC;
    let baseSample = incomeSamples[0];
    for (const sample of incomeSamples) { if (sample.time <= windowStart) baseSample = sample; else break; }
    const elapsed = gameTimeSec - baseSample.time;
    const rate = elapsed > 0 ? (totalEarnedPoints - baseSample.earned) / elapsed * 60 : 0;
    incomeSamples.push({ time: gameTimeSec, earned: totalEarnedPoints, rate });
}

function updateIncomeStats(dt) {
    gameTimeSec += dt;
    incomeSampleTimer += dt;
    if (incomeSampleTimer >= INCOME_SAMPLE_INTERVAL_SEC) {
    incomeSampleTimer -= INCOME_SAMPLE_INTERVAL_SEC;
    recordIncomeSample();
    drawIncomeChart();
    }
}

function logPurchase(name) {
    recordIncomeSample();                         // линия дорисовывается точно до момента покупки
    purchaseLog.push({ time: gameTimeSec, name });
    drawIncomeChart();
}

// Доход в минуту в произвольный момент времени (интерполяция между точками)
function getIncomeRateAt(time) {
    for (let i = 1; i < incomeSamples.length; i++) {
    const a = incomeSamples[i - 1], b = incomeSamples[i];
    if (time <= b.time) {
        const fraction = b.time === a.time ? 0 : (time - a.time) / (b.time - a.time);
        return a.rate + (b.rate - a.rate) * fraction;
    }
    }
    return incomeSamples[incomeSamples.length - 1].rate;
}

// Открывает или закрывает график на весь экран; пока он открыт, игра стоит на паузе
function toggleIncomeChart() {
  isChartOpen = !isChartOpen;
  chartOverlay.style.display = isChartOpen ? 'block' : 'none';
  if (isChartOpen) {
    chartCanvas.width = window.innerWidth;
    chartCanvas.height = window.innerHeight;
    chartScrollX = Infinity;                // при отрисовке значение сожмётся до правого края
    drawIncomeChart();
  }
}

chartOverlay.onmousedown = event => {
  isChartDragging = true; chartDragStartX = event.clientX; chartDragStartScroll = chartScrollX; chartDragDistance = 0;
};
chartOverlay.onmousemove = event => {
  if (isChartDragging) {
    chartDragDistance = Math.max(chartDragDistance, Math.abs(event.clientX - chartDragStartX));
    chartScrollX = chartDragStartScroll - (event.clientX - chartDragStartX);       // график следует за курсором
  }
  chartHoverX = event.clientX; chartHoverY = event.clientY;
  drawIncomeChart();
};
addEventListener('mouseup', () => { isChartDragging = false; });
chartOverlay.onclick = () => { if (chartDragDistance < 5) toggleIncomeChart(); };   // клик закрывает график, а перетаскивание нет
chartOverlay.addEventListener('wheel', event => {
  event.preventDefault();
  chartScrollX += event.deltaX + event.deltaY;
  drawIncomeChart();
}, { passive: false });                         // клик по графику закрывает его
addEventListener('resize', () => { if (isChartOpen) { chartCanvas.width = window.innerWidth; chartCanvas.height = window.innerHeight; drawIncomeChart(); } });

// Склеивает близкие покупки в группы. Волны не склеиваются
function groupChartEvents(pixelsPerSecond) {
  const groups = [];
  for (const event of purchaseLog) {
    const x = event.time * pixelsPerSecond, last = groups[groups.length - 1];
    const canJoin = last && !event.color && !last.isWave && x - last.firstX < CHART_GROUP_DISTANCE_PX;
    if (canJoin) last.events.push(event);
    else groups.push({ firstX: x, time: event.time, color: event.color || '#7CFC8A', isWave: !!event.color, events: [event] });
  }
  return groups;
}

// Подсказка со списком событий точки под курсором
function drawChartTooltip(c, hit, width) {
  const events = hit.group.events;
  const lines = events.slice(0, 12).map(event => formatMinutesSeconds(event.time) + '  ' + event.name);
  if (events.length > 12) lines.push('… и ещё ' + (events.length - 12));
  const boxWidth = Math.max(...lines.map(line => c.measureText(line).width)) + 16, boxHeight = lines.length * 16 + 10;
  const x = Math.min(hit.x + 12, width - boxWidth - 6), y = Math.max(30, hit.y - boxHeight - 10);
  c.fillStyle = '#222733'; c.fillRect(x, y, boxWidth, boxHeight);
  c.strokeStyle = '#f5c542'; c.lineWidth = 1; c.strokeRect(x, y, boxWidth, boxHeight);
  c.fillStyle = '#e8e8ee'; c.textAlign = 'left';
  lines.forEach((line, i) => c.fillText(line, x + 8, y + 16 + i * 16));
}

function drawIncomeChart() {
  if (!isChartOpen) return;
  const c = chartCanvas.getContext('2d'), width = chartCanvas.width, height = chartCanvas.height;
  const left = 60, right = 20, top = 24, bottom = 36;
  const visibleWidth = width - left - right, plotHeight = height - top - bottom;

  // Масштаб по времени: до 40 минут вся игра на экране, дальше масштаб замирает и график уходит за край
  const timeSpan = Math.max(120, Math.min(gameTimeSec, CHART_MAX_COMPRESSED_SEC));
  const pixelsPerSecond = visibleWidth / timeSpan;
  const contentWidth = Math.max(visibleWidth, gameTimeSec * pixelsPerSecond);
  chartScrollX = Math.max(0, Math.min(contentWidth - visibleWidth, chartScrollX));
  const xOf = time => time * pixelsPerSecond;

  // Масштаб по очкам в минуту
  const maxRate = Math.max(10, ...incomeSamples.map(sample => sample.rate)) * 1.15;
  const rawStep = maxRate / 5, magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const yMax = Math.ceil(rawStep / magnitude) * magnitude * 5;
  const yOf = rate => top + plotHeight - rate / yMax * plotHeight;

  c.fillStyle = '#0d0f14'; c.fillRect(0, 0, width, height);
  c.font = Math.max(11, Math.round(height / 45)) + 'px monospace'; c.lineWidth = 1;
  chartHitAreas = [];

  // Горизонтальная сетка и подписи оси Y (не прокручиваются)
  c.strokeStyle = '#2a3040'; c.fillStyle = '#9aa3b5'; c.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const y = yOf(yMax / 5 * i);
    c.beginPath(); c.moveTo(left, y); c.lineTo(width - right, y); c.stroke();
    c.fillText(Math.round(yMax / 5 * i), left - 6, y + 4);
  }

  // Прокручиваемая область: всё, что зависит от времени
  c.save();
  c.beginPath(); c.rect(left, 0, visibleWidth, height); c.clip();
  c.translate(left - chartScrollX, 0);

  // Вертикальная сетка: шаг подбирается так, чтобы подписи стояли не теснее 90 пикселей
  const stepSec = [60, 120, 300, 600, 900, 1800, 3600].find(step => step * pixelsPerSecond >= 90) || 3600;
  c.strokeStyle = '#2a3040'; c.fillStyle = '#9aa3b5'; c.textAlign = 'center';
  for (let t = Math.floor(chartScrollX / pixelsPerSecond / stepSec) * stepSec; t * pixelsPerSecond <= chartScrollX + visibleWidth; t += stepSec) {
    c.beginPath(); c.moveTo(xOf(t), top); c.lineTo(xOf(t), height - bottom); c.stroke();
    c.fillText(Math.round(t / 60) + ' мин', xOf(t), height - bottom + 16);
  }

  // Линия прогресса
  c.strokeStyle = '#f5c542'; c.lineWidth = 2; c.beginPath();
  incomeSamples.forEach((sample, i) => {
    if (i === 0) c.moveTo(xOf(sample.time), yOf(sample.rate)); else c.lineTo(xOf(sample.time), yOf(sample.rate));
  });
  c.stroke();

  // События: покупки (зелёные, близкие склеены) и волны (красные)
  let lastLabelX = -100;
  for (const group of groupChartEvents(pixelsPerSecond)) {
    const x = xOf(group.time), y = yOf(getIncomeRateAt(group.time)), count = group.events.length;
    c.strokeStyle = '#5b6478'; c.lineWidth = 1; c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(x, height - bottom); c.lineTo(x, y); c.stroke(); c.setLineDash([]);
    c.fillStyle = group.color; c.beginPath(); c.arc(x, y, count > 1 ? 5.5 : 3.5, 0, Math.PI * 2); c.fill();
    chartHitAreas.push({ x: left - chartScrollX + x, y, group });

    const name = group.events[0].name + (count > 1 ? ' (+' + (count - 1) + ')' : '');
    const label = name.length > 26 ? name.slice(0, 25) + '…' : name;
    const labelX = Math.max(x, lastLabelX + 13);                       // подписи не наезжают друг на друга
    lastLabelX = labelX;
    const goesUp = y - 8 - c.measureText(label).width > 2;
    c.save();
    c.translate(labelX, goesUp ? y - 8 : y + 8);
    c.rotate(goesUp ? -Math.PI / 2 : Math.PI / 2);
    c.textAlign = 'left'; c.fillStyle = '#e8e8ee'; c.fillText(label, 0, 4);
    c.restore();
  }
  c.restore();                                                          // конец прокручиваемой области

  // Подсказка под курсором
  const hit = !isChartDragging && chartHitAreas.find(area => area.x >= left && area.x <= width - right && Math.hypot(area.x - chartHoverX, area.y - chartHoverY) < 10);
  if (hit) drawChartTooltip(c, hit, width);

  // Подписи осей, полоса прокрутки и подсказка по управлению
  c.fillStyle = '#9aa3b5'; c.textAlign = 'left'; c.fillText('Заработано очков в минуту', left, 14);
  c.textAlign = 'right'; c.fillText('Время игры', width - right, height - 8);
  if (contentWidth > visibleWidth) {
    c.fillStyle = '#2a3040'; c.fillRect(left, height - 5, visibleWidth, 4);
    c.fillStyle = '#5b6478'; c.fillRect(left + chartScrollX / contentWidth * visibleWidth, height - 5, visibleWidth / contentWidth * visibleWidth, 4);
  }
  c.textAlign = 'center'; c.fillText('G, Esc или клик — закрыть · колесо или перетаскивание — прокрутка · игра на паузе', width / 2, 14);
}