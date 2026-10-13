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