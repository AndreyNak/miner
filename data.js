// --- Блоки ---
const BLOCK = {
  DIRT: 1, CLAY: 2, GRAVEL: 3, COBBLESTONE: 4, IRON_ORE: 5, CRYSTAL: 6, VOID_ORE: 7,
  DARK_CRYSYAL: 8, SAND: 9, MUD: 10, PACKED_SAND: 11, SANDSTONE: 12, GOLD: 13, TOPAZ: 14
};

const BIOMES = [
  { id: 'slime_valley', name: 'Долина слизней', costPoints: 0, costFuel: 0 },
  { id: 'sand_dunes', name: 'Песчаные дюны', costPoints: 15000, costFuel: 50 },
];


// durability — крепкость, level — нужный уровень инструмента, points — очки за добычу
const BLOCK_TYPES = [null,
  { name: 'земля', durability: 5, level: 1, points: 1, colors: ['#7a4a26', '#6b3f20', '#8a5830', '#5e3519'] },
  { name: 'глина', durability: 8, level: 1, points: 3, colors: ['#8b6a4a', '#5a8f8c', '#9a7550', '#4e7f7f'] },
  { name: 'гравий', durability: 12, level: 2, points: 6, colors: ['#b8bcc2', '#a4a8ae', '#c9cdd2', '#9298a0'] },
  { name: 'булыжник', durability: 20, level: 3, points: 15, colors: ['#5a5d63', '#4a4d53', '#6a6d73', '#3c3f45'] },
  { name: 'железная руда', durability: 35, level: 4, points: 40, colors: ['#5a5d63', '#8a7a6a', '#c9803a', '#4a4d53'] },
  { name: 'кристалл', durability: 60, level: 5, points: 120, colors: ['#2a3a5a', '#4fd8e8', '#2a6a8a', '#a8f4ff'] },
  { name: 'порода бездны', durability: 999, level: 99, points: 500, colors: ['#251e2b', '#653747', '#b66a4a', '#d9b77e'] },
  { name: 'темный кристал', durability: 150, level: 5, points: 500, colors: ['#3a0566', '#4a4d53', '#6a6d73', '#5d139a'] },
  { name: 'песок', durability: 65, level: 5, points: 100, colors: ['#e3c98a', '#d4b672', '#efd9a0', '#c4a35e'] },
  { name: 'грязь', durability: 95, level: 5, points: 300, colors: ['#4a3320', '#3d2a1a', '#5a3f28', '#33220f'] },
  { name: 'плотный песок', durability: 145, level: 6, points: 600, colors: ['#C18B45', '#ad7e49', '#E0AD61', '#E0AD61'] },
  { name: 'песчаник', durability: 270, level: 7, points: 1200, colors: ['#E47745', '#B94E2D', '#FF9B65', '#8E3824'] },
  { name: 'золото', durability: 800, level: 8, points: 5000, colors: ['#B8860B', '#FFD700', '#FFF176', '#8C6508'] },
  { name: 'топаз', durability: 1600, level: 9, points: 20000, colors: ['#167D8D', '#22C7B8', '#80F0D0', '#105461'] }
];

// Уровни динамита: до какого уровня руды рвёт, урон в центре взрыва, цена пачки
const DYNAMITE_LEVELS = [
  { maxBlockLevel: 3, damage: 50, packPrice: 800 },
  { maxBlockLevel: 4, damage: 100, packPrice: 1500 },
  { maxBlockLevel: 5, damage: 200, packPrice: 2000 }];

const SAND_DUNES_BLOCK_LAYERS = [
  {
    maxDepth: 10,
    oxygenCost: 0,
    blocks: [
      [BLOCK.SAND, 75],
      [BLOCK.MUD, 20],
      [BLOCK.PACKED_SAND, 4],
      [BLOCK.SANDSTONE, 1],
    ],
  },
  {
    maxDepth: 30,
    oxygenCost: 100,
    blocks: [
      [BLOCK.SAND, 25],
      [BLOCK.MUD, 35],
      [BLOCK.PACKED_SAND, 25],
      [BLOCK.SANDSTONE, 15],
    ],
  },
  {
    maxDepth: 60,
    oxygenCost: 120,
    blocks: [
      [BLOCK.MUD, 5],
      [BLOCK.PACKED_SAND, 45],
      [BLOCK.SANDSTONE, 50],
    ],
  },
  {
    maxDepth: 100,
    oxygenCost: 150,
    blocks: [
      [BLOCK.PACKED_SAND, 5],
      [BLOCK.SANDSTONE, 75],
      [BLOCK.GOLD, 20],
    ],
  },
  {
    maxDepth: Infinity,
    oxygenCost: 200,
    blocks: [
      [BLOCK.SANDSTONE, 70],
      [BLOCK.GOLD, 25],
      [BLOCK.TOPAZ, 5],
    ],
  },
]

const SLIME_VALLEY_BLOCK_LAYERS = [
  {
    maxDepth: 10,
    oxygenCost: 0,
    blocks: [
      [BLOCK.DIRT, 75],
      [BLOCK.CLAY, 20],
      [BLOCK.GRAVEL, 4],
      [BLOCK.COBBLESTONE, 1],
    ],
  },
  {
    maxDepth: 30,
    oxygenCost: 5,
    blocks: [
      [BLOCK.DIRT, 25],
      [BLOCK.CLAY, 35],
      [BLOCK.GRAVEL, 25],
      [BLOCK.COBBLESTONE, 15],
    ],
  },
  {
    maxDepth: 60,
    oxygenCost: 15,
    blocks: [
      [BLOCK.CLAY, 5],
      [BLOCK.GRAVEL, 45],
      [BLOCK.COBBLESTONE, 50],
    ],
  },
  {
    maxDepth: 100,
    oxygenCost: 40,
    blocks: [
      [BLOCK.GRAVEL, 5],
      [BLOCK.COBBLESTONE, 75],
      [BLOCK.IRON_ORE, 20],
    ],
  },
  {
    maxDepth: Infinity,
    oxygenCost: 150,
    blocks: [
      [BLOCK.COBBLESTONE, 69.7],
      [BLOCK.IRON_ORE, 25],
      [BLOCK.CRYSTAL, 5],
      [BLOCK.DARK_CRYSYAL, 0.3],
    ],
  },
];

const BIOME_BLOCK_LAYERS = {
  slime_valley: SLIME_VALLEY_BLOCK_LAYERS,
  sand_dunes: SAND_DUNES_BLOCK_LAYERS
}

// --- Оружие (ЛКМ) ---
// damage — урон, cooldown — секунд между ударами, energyCost — энергия за удар, radiusTiles — радиус в блоках
const WEAPONS = [
  { name: 'Палка', family: 'melee', tier: 1, damage: 2, cooldown: 1, energyCost: 5, radiusTiles: 1, cost: 0, color: '#b58a4a' },
  { name: 'Деревянный меч', family: 'melee', tier: 2, damage: 4, cooldown: 1, energyCost: 10, radiusTiles: 2, cost: 50, color: '#d9a65a' },
  { name: 'Каменный меч', family: 'melee', tier: 3, damage: 10, cooldown: 0.8, energyCost: 15, radiusTiles: 2, cost: 500, color: '#a9b0b8' },
  { name: 'Железный меч', family: 'melee', tier: 4, damage: 18, cooldown: 0.7, energyCost: 23, radiusTiles: 2, cost: 3000, color: '#e0e0ea' },
  { name: 'Кристальный меч', family: 'melee', tier: 5, damage: 35, cooldown: 0.6, energyCost: 40, radiusTiles: 2, cost: 10000, color: '#4fd8e8' },
  { name: 'Деревянный лук', family: 'range', tier: 1, damage: 20, cooldown: 1.2, energyCost: 40, radiusTiles: 50, cost: 25000, color: '#d9a65a' },
  { name: 'Золотой меч', family: 'melee', tier: 6, damage: 45, cooldown: 0.6, energyCost: 50, radiusTiles: 2, cost: 30000, color: '#f9d267' },
  { name: 'Кобальтовый меч', family: 'melee', tier: 7, damage: 90, cooldown: 1.2, energyCost: 90, radiusTiles: 2, cost: 100000, color: '#25538e' },
];


// --- Инструменты (ПКМ) ---
// level — какие блоки может копать, power — сколько крепкости снимает за удар
const TOOLS = [
  { name: 'Деревянная лопата', family: 'shovel', tier: 1, level: 1, power: 1, energyCost: 1, radiusTiles: 1, cost: 0, color: '#d9a65a' },
  { name: 'Каменная лопата', family: 'shovel', tier: 2, level: 1, power: 3, energyCost: 2, radiusTiles: 2, cost: 60, color: '#a9b0b8' },
  { name: 'Деревянная кирка', family: 'pickaxe', tier: 1, level: 2, power: 5, energyCost: 3, radiusTiles: 1, cost: 450, color: '#d9a65a' },
  { name: 'Железная лопата', family: 'shovel', tier: 3, level: 2, power: 6, energyCost: 1, radiusTiles: 3, cost: 2500, color: '#e0e0ea' },
  { name: 'Каменная кирка', family: 'pickaxe', tier: 2, level: 3, power: 8, energyCost: 4, radiusTiles: 2, cost: 6000, color: '#a9b0b8' },
  { name: 'Железная кирка', family: 'pickaxe', tier: 3, level: 4, power: 14, energyCost: 6, radiusTiles: 2, cost: 12000, color: '#e0e0ea' },
  { name: 'Кристальная кирка', family: 'pickaxe', tier: 4, level: 5, power: 24, energyCost: 9, radiusTiles: 3, cost: 25000, color: '#4fd8e8' },
  { name: 'Золотая кирка', family: 'pickaxe', tier: 5, level: 6, power: 35, energyCost: 13, radiusTiles: 3, cost: 60000, color: '#f9d267' },
  { name: 'Кобальтовая кирка', family: 'pickaxe', tier: 6, level: 7, power: 45, energyCost: 19, radiusTiles: 3, cost: 150000, color: '#25538e' },
  { name: 'Мифриловая кирка', family: 'pickaxe', tier: 7, level: 10, power: 550, energyCost: 25, radiusTiles: 4, cost: 500000, color: '#33842e' }
];


// --- Орудие базы (индекс = уровень улучшения) ---
const TURRET_LEVELS = [null, { damage: 3, cooldown: 1.5 }, { damage: 6, cooldown: 1.1 }, { damage: 12, cooldown: 0.8 }, { damage: 20, cooldown: 0.8 }];

// --- Враги волн ---
const GREEN_SLIME = 0, BLUE_SLIME = 1, YELLOW_SLIME = 2, BOSS_SLIME = 3, BAT = 4;

const ENEMY_TYPES = [
  { hp: 5, damage: 5, speed: 15, width: 16, height: 12, points: 5, color: '#4fc84f', shadeColor: "#2f9a2f", kind: 'slime' },    // зелёный
  { hp: 10, damage: 15, speed: 18, width: 16, height: 12, points: 20, color: "#3f6fe0", shadeColor: "#2a4aa0", kind: 'slime' }, // синий
  { hp: 30, damage: 35, speed: 20, width: 16, height: 12, points: 60, color: "#deb63e", shadeColor: "#6f5b1e", kind: 'slime' },    // желтый
  { hp: 1300, damage: 100, speed: 15, width: 80, height: 60, points: 15000, color: "#461b6a", shadeColor: "#311349", kind: 'slimeBoss' }, // босс слайм
  { hp: 35, damage: 20, speed: 22, width: 18, height: 16, points: 80, color: "#303452", shadeColor: "#311349", kind: 'bat' }, // летучая мышь
];

const SLIME_VALLEY_CAVE_ENEMY_LAYERS = [
  {
    maxDepth: 30,
    spawnChance: 0.02,
    hpMultiplier: 1, damageMultiplier: 1, pointsMultiplier: 1,
    slimes: [[GREEN_SLIME, 85], [BLUE_SLIME, 15]]
  },
  {
    maxDepth: 100,
    spawnChance: 0.04,
    hpMultiplier: 1.5, damageMultiplier: 2, pointsMultiplier: 1.5,
    slimes: [[GREEN_SLIME, 30], [BLUE_SLIME, 55], [YELLOW_SLIME, 15]]
  },
  {
    maxDepth: Infinity,
    spawnChance: 0.07,
    hpMultiplier: 2.5, damageMultiplier: 4, pointsMultiplier: 3,
    slimes: [[BLUE_SLIME, 30], [YELLOW_SLIME, 70]]
  },
];

const SAND_DUNES_CAVE_ENEMY_LAYERS = [
  {
    maxDepth: 30,
    spawnChance: 0.02,
    hpMultiplier: 1.5, damageMultiplier: 3, pointsMultiplier: 30,
    slimes: [[BLUE_SLIME, 50], [YELLOW_SLIME, 50]]
  },
  {
    maxDepth: 100,
    spawnChance: 0.04,
    hpMultiplier: 3, damageMultiplier: 5, pointsMultiplier: 100,
    slimes: [[BLUE_SLIME, 25], [YELLOW_SLIME, 75]]
  },
  {
    maxDepth: Infinity,
    spawnChance: 0.07,
    hpMultiplier: 4, damageMultiplier: 7, pointsMultiplier: 150,
    slimes: [[YELLOW_SLIME, 100]]
  },
];


const BIOME_CAVE_ENEMY_LAYERS = {
  slime_valley: SLIME_VALLEY_CAVE_ENEMY_LAYERS,
  sand_dunes: SAND_DUNES_CAVE_ENEMY_LAYERS
}

const CAVE_CHEST_LAYERS = [
  { maxDepth: 30, spawnChance: 0, chest: { points: 0, hp: 10, maxHp: 10, width: 20, height: 16 } },
  { maxDepth: 60, spawnChance: 0.015, chest: { points: 1000, hp: 10, maxHp: 10, width: 20, height: 16 } },
  { maxDepth: 120, spawnChance: 0.025, chest: { points: 1000, hp: 10, maxHp: 10, width: 20, height: 16 } },
  { maxDepth: Infinity, spawnChance: 0.060, chest: { points: 1000, hp: 10, maxHp: 10, width: 20, height: 16 } }
]


// Какие улучшения показывать на вкладках магазина
const SHOP_TABS = {
  'Персонаж': ['energy', 'energyRegen', 'energySaving', 'maxHp', 'hpRegen', 'armor', 'maxOxygen', 'oxygenRegen', 'oxygenFreeDepth', 'moveSpeed', 'jumpPower', 'luck', 'teleportCooldown'],
  'База': ['baseEnergyRegen', 'baseHealRate', 'baseMaxHp', 'baseRepair', 'baseMining', 'turret', 'maxFuel', 'fuelRegen'],
  'Расходники': ['ladder', 'dynamite', 'dynamiteUpgrade', 'bossSlime']
};

const SHOP_TAB_NAMES = ['Персонаж', 'Оружие', 'Инструменты', 'База', 'Расходники'];
const DEV_CODE = '1337';