const INCOME_SAMPLE_INTERVAL_SEC = 5 // как часто записываем точку графика
const INCOME_WINDOW_SEC = 60;           // доход считается за последнюю минуту

const chartOverlay = document.getElementById('chartOverlay');
let isChartOpen = false;
const chartCanvas = document.getElementById('incomeChart');


let gameTimeSec = 0, totalEarnedPoints = 0, incomeSampleTimer = 0;
let incomeSamples = [];   // точки графика: { time, earned, rate }
let purchaseLog = [];     // покупки: { time, name }


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
    chartCanvas.width = window.innerWidth;     // холст подгоняется под размер окна
    chartCanvas.height = window.innerHeight;
    drawIncomeChart();
    }
}

chartOverlay.onclick = toggleIncomeChart;                          // клик по графику закрывает его
addEventListener('resize', () => { if (isChartOpen) { chartCanvas.width = window.innerWidth; chartCanvas.height = window.innerHeight; drawIncomeChart(); } });

function drawIncomeChart() {
    if (!isChartOpen) return;

    const c = chartCanvas.getContext('2d'), width = chartCanvas.width, height = chartCanvas.height;
    const left = 60, right = 20, top = 24, bottom = 36;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;

    // Масштабы осей
    const maxTime = Math.max(120, gameTimeSec);
    const maxRate = Math.max(10, ...incomeSamples.map(s => s.rate)) * 1.15;
    const rawStep = maxRate / 5, magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const yMax = Math.ceil(rawStep / magnitude) * magnitude * 5;
    const xStep = maxTime <= 600 ? 60 : maxTime <= 1800 ? 300 : 600;
    const xOf = time => left + time / maxTime * plotWidth;
    const yOf = rate => top + plotHeight - rate / yMax * plotHeight;

    c.fillStyle = '#0d0f14'; c.fillRect(0, 0, width, height);
    c.font = Math.max(11, Math.round(height / 45)) + 'px monospace'; c.lineWidth = 1;

    // Сетка и подписи осей
    c.strokeStyle = '#2a3040'; c.fillStyle = '#9aa3b5';
    c.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
    const y = yOf(yMax / 5 * i);
    c.beginPath(); c.moveTo(left, y); c.lineTo(width - right, y); c.stroke();
    c.fillText(Math.round(yMax / 5 * i), left - 6, y + 4);
    }
    c.textAlign = 'center';
    for (let t = 0; t <= maxTime; t += xStep) {
    const x = xOf(t);
    c.beginPath(); c.moveTo(x, top); c.lineTo(x, height - bottom); c.stroke();
    c.fillText(Math.round(t / 60) + ' мин', x, height - bottom + 16);
    }
    c.textAlign = 'left'; c.fillText('Заработано очков в минуту', left, 14);
    c.textAlign = 'right'; c.fillText('Время игры', width - right, height - 6);

    // Линия прогресса
    c.strokeStyle = '#f5c542'; c.lineWidth = 2; c.beginPath();
    incomeSamples.forEach((sample, i) => {
    if (i === 0) c.moveTo(xOf(sample.time), yOf(sample.rate)); else c.lineTo(xOf(sample.time), yOf(sample.rate));
    });
    c.stroke();

    // Покупки: точка на линии, пунктир вниз и подпись (вверх, а если не хватает места — вниз)
    let lastLabelX = -100;
    for (const purchase of purchaseLog) {
    const x = xOf(purchase.time), y = yOf(getIncomeRateAt(purchase.time));
    c.strokeStyle = '#5b6478'; c.lineWidth = 1; c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(x, height - bottom); c.lineTo(x, y); c.stroke(); c.setLineDash([]);
    c.fillStyle = purchase.color || '#7CFC8A'; c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill();

    const label = purchase.name.length > 26 ? purchase.name.slice(0, 25) + '…' : purchase.name;
    const labelX = Math.min(width - 6, Math.max(x, lastLabelX + 13));     // подписи не наезжают друг на друга
    lastLabelX = labelX;
    const goesUp = y - 8 - c.measureText(label).width > 2;
    c.save();
    c.translate(labelX, goesUp ? y - 8 : y + 8);
    c.rotate(goesUp ? -Math.PI / 2 : Math.PI / 2);
    c.textAlign = 'left'; c.fillStyle = '#e8e8ee';
    c.fillText(label, 0, 4);
    c.restore();

    c.textAlign = 'center'; c.fillStyle = '#9aa3b5';
    c.fillText('G, Esc или клик — закрыть · игра на паузе', width / 2, 14);
    }
}