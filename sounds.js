let blockBreakAudio;
let musicStarted = false;
let bgMusic;

function getMusic() {
    bgMusic = new Audio('musics/background_music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.1;
    return bgMusic;
}

 
function startMusicOnce() {
    if (musicStarted) return;
    musicStarted = true;
    getMusic().play().catch(err => console.warn('Музыка не запустилась:', err));
    window.removeEventListener('keydown', startMusicOnce);  
}

function playBlockBreak() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  if (!blockBreakAudio) {
    blockBreakAudio = new AudioContextClass();
  }

  const ctx = blockBreakAudio;

  // AudioContext может быть приостановлен браузером
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Небольшая случайность для естественного звучания
  const random = (min, max) =>
    min + Math.random() * (max - min);

  // Общая громкость
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.7, now);
  master.connect(ctx.destination);

  // 1. Глухой удар
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();

  thump.type = "sine";
  thump.frequency.setValueAtTime(
    random(100, 160), now
  );
  thump.frequency.exponentialRampToValueAtTime(
    random(45, 65), now + 0.09
  );

  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(
    0.8, now + 0.006
  );
  thumpGain.gain.exponentialRampToValueAtTime(
    0.0001, now + 0.11
  );

  thump.connect(thumpGain);
  thumpGain.connect(master);

  thump.start(now);
  thump.stop(now + 0.12);

  // 2. Шум крошки и треска
  const duration = 0.12;
  const buffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * duration),
    ctx.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    // Шум с быстрым затуханием
    const fade = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = random(900, 1800);
  filter.Q.value = 0.7;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(
    random(0.3, 0.5), now + 0.004
  );
  noiseGain.gain.exponentialRampToValueAtTime(
    0.0001, now + duration
  );

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);

  noise.start(now);
  noise.stop(now + duration);

  // 3. Пара коротких щелчков
  for (let i = 0; i < 2; i++) {
    const start = now + random(0.015, 0.055);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();

    click.type = "square";
    click.frequency.value = random(500, 1100);

    clickGain.gain.setValueAtTime(0.0001, start);
    clickGain.gain.exponentialRampToValueAtTime(
      0.07, start + 0.002
    );
    clickGain.gain.exponentialRampToValueAtTime(
      0.0001, start + 0.018
    );

    click.connect(clickGain);
    clickGain.connect(master);

    click.start(start);
    click.stop(start + 0.02);
  }

  // Удаляем соединение после затухания звука
  setTimeout(() => master.disconnect(), 300);
}


let hitAudioContext;

function playTargetHit() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  if (!hitAudioContext) {
    hitAudioContext = new AudioContextClass();
  }

  const ctx = hitAudioContext;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const random = (min, max) =>
    min + Math.random() * (max - min);

  const master = ctx.createGain();
  master.gain.value = 0.65;
  master.connect(ctx.destination);

  // 1. Короткий низкий импульс удара
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();

  body.type = "sine";
  body.frequency.setValueAtTime(random(115, 165), now);
  body.frequency.exponentialRampToValueAtTime(
    random(55, 75), now + 0.075
  );

  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(
    0.85, now + 0.004
  );
  bodyGain.gain.exponentialRampToValueAtTime(
    0.0001, now + 0.09
  );

  body.connect(bodyGain);
  bodyGain.connect(master);
  body.start(now);
  body.stop(now + 0.1);

  // 2. Сухой шумовой щелчок
  const duration = 0.065;
  const buffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * duration),
    ctx.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) *
      Math.pow(1 - i / data.length, 3);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = random(700, 1400);
  filter.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(
    0.55, now + 0.003
  );
  noiseGain.gain.exponentialRampToValueAtTime(
    0.0001, now + duration
  );

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);

  noise.start(now);
  noise.stop(now + duration);

  // 3. Высокий щелчок для ощущения контакта
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();

  click.type = "triangle";
  click.frequency.value = random(950, 1500);

  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(
    0.16, now + 0.002
  );
  clickGain.gain.exponentialRampToValueAtTime(
    0.0001, now + 0.025
  );

  click.connect(clickGain);
  clickGain.connect(master);
  click.start(now);
  click.stop(now + 0.03);

  setTimeout(() => master.disconnect(), 250);
}

let audioCtx;

function playDynamiteExplosion() {
  // Создаём аудиоконтекст при первом вызове
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  // 1. Низкий глухой удар
  const boom = audioCtx.createOscillator();
  const boomGain = audioCtx.createGain();

  boom.type = "sine";
  boom.frequency.setValueAtTime(100, now);
  boom.frequency.exponentialRampToValueAtTime(25, now + 0.35);

  boomGain.gain.setValueAtTime(0.9, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  boom.connect(boomGain);
  boomGain.connect(audioCtx.destination);

  boom.start(now);
  boom.stop(now + 0.4);

  // 2. Резкий шум взрыва
  const duration = 0.6;
  const bufferSize = Math.floor(audioCtx.sampleRate * duration);

  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);

  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  // Убираем высокочастотный цифровой писк
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(150, now + duration);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.8, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  noise.start(now);
  noise.stop(now + duration);
}

let bowCtx;

function playBowShot() {
    if (!bowCtx) {
        bowCtx = new (
            window.AudioContext || window.webkitAudioContext
        )();
    }

    const ctx = bowCtx;

    if (ctx.state === "suspended") {
        ctx.resume();
    }

    const t = ctx.currentTime;

    // 1. Короткий щелчок тетивы
    const length = Math.floor(ctx.sampleRate * 0.09);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
        const fade = Math.pow(1 - i / length, 5);
        data[i] = (Math.random() * 2 - 1) * fade;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.65, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    noise.connect(filter);
    filter.connect(snapGain);
    snapGain.connect(ctx.destination);

    noise.start(t);

    // 2. Низкий деревянный призвук лука
    const wood = ctx.createOscillator();
    const woodGain = ctx.createGain();

    wood.type = "triangle";
    wood.frequency.setValueAtTime(135, t);
    wood.frequency.exponentialRampToValueAtTime(65, t + 0.075);

    woodGain.gain.setValueAtTime(0.22, t);
    woodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

    wood.connect(woodGain);
    woodGain.connect(ctx.destination);

    wood.start(t);
    wood.stop(t + 0.09);

    // 3. Тихий шелест улетающей стрелы
    const arrowLength = Math.floor(ctx.sampleRate * 0.12);
    const arrowBuffer = ctx.createBuffer(
        1, arrowLength, ctx.sampleRate
    );

    const arrowData = arrowBuffer.getChannelData(0);

    for (let i = 0; i < arrowLength; i++) {
        const fade = Math.pow(1 - i / arrowLength, 3);
        arrowData[i] = (Math.random() * 2 - 1) * fade;
    }

    const arrowNoise = ctx.createBufferSource();
    arrowNoise.buffer = arrowBuffer;

    const arrowFilter = ctx.createBiquadFilter();
    arrowFilter.type = "lowpass";
    arrowFilter.frequency.value = 650;

    const arrowGain = ctx.createGain();
    arrowGain.gain.setValueAtTime(0.001, t);
    arrowGain.gain.setValueAtTime(0.12, t + 0.015);
    arrowGain.gain.exponentialRampToValueAtTime(
        0.001, t + 0.12
    );

    arrowNoise.connect(arrowFilter);
    arrowFilter.connect(arrowGain);
    arrowGain.connect(ctx.destination);

    arrowNoise.start(t + 0.015);
}