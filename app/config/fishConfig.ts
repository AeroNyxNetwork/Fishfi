/**
 * fishConfig.ts
 * 
 * Configuration file for fish generation parameters
 * Defines all possible traits, patterns, and visual properties
 * 
 * @version 1.0.0
 * @path app/config/fishConfig.ts
 */

/**
 * Pattern definitions with visual properties
 */
export const PATTERNS = {
  stripes: {
    name: 'Stripes',
    description: 'Vertical stripes across the body',
    complexity: 1,
    renderFunction: 'drawStripePattern'
  },
  dots: {
    name: 'Dots',
    description: 'Scattered dots pattern',
    complexity: 1,
    renderFunction: 'drawDotPattern'
  },
  scales: {
    name: 'Scales',
    description: 'Fish scale pattern',
    complexity: 2,
    renderFunction: 'drawScalePattern'
  },
  waves: {
    name: 'Waves',
    description: 'Wavy pattern',
    complexity: 2,
    renderFunction: 'drawWavePattern'
  },
  spirals: {
    name: 'Spirals',
    description: 'Spiral patterns',
    complexity: 3,
    renderFunction: 'drawSpiralPattern'
  },
  fractals: {
    name: 'Fractals',
    description: 'Fractal-based patterns',
    complexity: 4,
    renderFunction: 'drawFractalPattern'
  },
  circuits: {
    name: 'Circuits',
    description: 'Electronic circuit pattern',
    complexity: 3,
    renderFunction: 'drawCircuitPattern'
  },
  crystals: {
    name: 'Crystals',
    description: 'Crystalline structures',
    complexity: 3,
    renderFunction: 'drawCrystalPattern'
  },
  stars: {
    name: 'Stars',
    description: 'Starfield pattern',
    complexity: 2,
    renderFunction: 'drawStarPattern'
  },
  void: {
    name: 'Void',
    description: 'Void-like dark pattern',
    complexity: 4,
    renderFunction: 'drawVoidPattern'
  },
  gradient: {
    name: 'Gradient',
    description: 'Smooth color gradient',
    complexity: 1,
    renderFunction: 'drawGradientPattern'
  },
  noise: {
    name: 'Noise',
    description: 'Perlin noise pattern',
    complexity: 3,
    renderFunction: 'drawNoisePattern'
  },
  geometric: {
    name: 'Geometric',
    description: 'Geometric shapes',
    complexity: 2,
    renderFunction: 'drawGeometricPattern'
  },
  organic: {
    name: 'Organic',
    description: 'Organic flowing pattern',
    complexity: 3,
    renderFunction: 'drawOrganicPattern'
  },
  mystic: {
    name: 'Mystic',
    description: 'Mystical symbols',
    complexity: 4,
    renderFunction: 'drawMysticPattern'
  }
} as const;

/**
 * Mutation definitions with visual effects
 */
export const MUTATIONS = {
  albino: {
    name: 'Albino',
    description: 'Lack of pigmentation',
    effect: 'Inverts colors, adds pink tint',
    rarity: 'rare'
  },
  melanistic: {
    name: 'Melanistic',
    description: 'Excess pigmentation',
    effect: 'Darkens all colors',
    rarity: 'rare'
  },
  iridescent: {
    name: 'Iridescent',
    description: 'Rainbow-like sheen',
    effect: 'Color shifts based on position',
    rarity: 'epic'
  },
  translucent: {
    name: 'Translucent',
    description: 'See-through body',
    effect: 'Reduces opacity, shows internals',
    rarity: 'epic'
  },
  bioluminescent: {
    name: 'Bioluminescent',
    description: 'Natural glow',
    effect: 'Glowing spots and lines',
    rarity: 'legendary'
  },
  prismatic: {
    name: 'Prismatic',
    description: 'Light-splitting scales',
    effect: 'Rainbow reflections',
    rarity: 'legendary'
  },
  chromatic: {
    name: 'Chromatic',
    description: 'Color-shifting',
    effect: 'Animated color changes',
    rarity: 'legendary'
  },
  metallic: {
    name: 'Metallic',
    description: 'Metal-like scales',
    effect: 'Metallic sheen and reflection',
    rarity: 'epic'
  },
  holographic: {
    name: 'Holographic',
    description: 'Hologram effect',
    effect: 'Holographic overlay',
    rarity: 'mythic'
  },
  quantum: {
    name: 'Quantum',
    description: 'Phase-shifting',
    effect: 'Partially phases in/out',
    rarity: 'mythic'
  },
  ethereal: {
    name: 'Ethereal',
    description: 'Ghost-like',
    effect: 'Translucent with glow',
    rarity: 'mythic'
  },
  celestial: {
    name: 'Celestial',
    description: 'Star-touched',
    effect: 'Contains starfield',
    rarity: 'cosmic'
  },
  'void-touched': {
    name: 'Void-touched',
    description: 'Touched by the void',
    effect: 'Dark matter effects',
    rarity: 'cosmic'
  },
  'crystal-infused': {
    name: 'Crystal-infused',
    description: 'Crystal growths',
    effect: 'Crystal formations on body',
    rarity: 'legendary'
  },
  'plasma-charged': {
    name: 'Plasma-charged',
    description: 'Plasma energy',
    effect: 'Plasma effects and glow',
    rarity: 'cosmic'
  }
} as const;

/**
 * Special traits that can appear on fish
 */
export const SPECIAL_TRAITS = {
  // Visual traits
  glowing_eyes: {
    name: 'Glowing Eyes',
    description: 'Eyes emit light',
    visualEffect: 'eye_glow'
  },
  crown: {
    name: 'Crown',
    description: 'Royal crown marking',
    visualEffect: 'crown_overlay'
  },
  ancient_marks: {
    name: 'Ancient Marks',
    description: 'Mysterious symbols',
    visualEffect: 'symbol_overlay'
  },
  stardustTrail: {
    name: 'Stardust Trail',
    description: 'Leaves trail of stardust',
    visualEffect: 'particle_trail'
  },
  
  // Behavioral traits
  aggressive: {
    name: 'Aggressive',
    description: 'Hostile behavior',
    behaviorModifier: 'aggressive_ai'
  },
  peaceful: {
    name: 'Peaceful',
    description: 'Calm demeanor',
    behaviorModifier: 'peaceful_ai'
  },
  curious: {
    name: 'Curious',
    description: 'Investigates objects',
    behaviorModifier: 'curious_ai'
  },
  
  // Ability traits
  fast_swimmer: {
    name: 'Fast Swimmer',
    description: '50% faster movement',
    statModifier: { speed: 1.5 }
  },
  tank: {
    name: 'Tank',
    description: 'Double health',
    statModifier: { health: 2.0 }
  },
  tiny: {
    name: 'Tiny',
    description: 'Half size',
    statModifier: { size: 0.5 }
  },
  giant: {
    name: 'Giant',
    description: 'Double size',
    statModifier: { size: 2.0 }
  }
} as const;

/**
 * Color palettes for different themes
 */
export const COLOR_PALETTES = {
  tropical: {
    name: 'Tropical',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  },
  deep_sea: {
    name: 'Deep Sea',
    colors: ['#05668D', '#028090', '#00A896', '#02C39A', '#F0F3BD']
  },
  neon: {
    name: 'Neon',
    colors: ['#08F7FE', '#09FBD3', '#FE53BB', '#F5D300', '#00ff41']
  },
  pastel: {
    name: 'Pastel',
    colors: ['#FFB5E8', '#FF9CEE', '#FFCCF9', '#FCC2FF', '#F6A6FF']
  },
  monochrome: {
    name: 'Monochrome',
    colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC']
  },
  fire: {
    name: 'Fire',
    colors: ['#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500']
  },
  ice: {
    name: 'Ice',
    colors: ['#00FFFF', '#00CED1', '#4682B4', '#1E90FF', '#87CEEB']
  },
  nature: {
    name: 'Nature',
    colors: ['#228B22', '#32CD32', '#00FF00', '#7CFC00', '#ADFF2F']
  },
  cosmic: {
    name: 'Cosmic',
    colors: ['#4A0080', '#6A0DAD', '#7F00FF', '#9400D3', '#9932CC']
  },
  golden: {
    name: 'Golden',
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#DC143C']
  }
} as const;

/**
 * Animation configurations
 */
export const ANIMATIONS = {
  swim: {
    duration: 3000,
    easing: 'sinInOut',
    properties: ['rotation', 'scaleY']
  },
  float: {
    duration: 4000,
    easing: 'sinInOut',
    properties: ['y']
  },
  glow: {
    duration: 2000,
    easing: 'sinInOut',
    properties: ['alpha', 'scale']
  },
  shimmer: {
    duration: 1500,
    easing: 'linear',
    properties: ['tint']
  }
} as const;

/**
 * Rarity weights and value multipliers
 */
export const RARITY_CONFIG = {
  common: {
    weight: 5000,  // 50%
    valueMultiplier: 1,
    particleCount: 0,
    glowIntensity: 0
  },
  uncommon: {
    weight: 3000,  // 30%
    valueMultiplier: 5,
    particleCount: 0,
    glowIntensity: 0.2
  },
  rare: {
    weight: 1300,  // 13%
    valueMultiplier: 20,
    particleCount: 5,
    glowIntensity: 0.4
  },
  epic: {
    weight: 500,   // 5%
    valueMultiplier: 50,
    particleCount: 10,
    glowIntensity: 0.6
  },
  legendary: {
    weight: 150,   // 1.5%
    valueMultiplier: 200,
    particleCount: 15,
    glowIntensity: 0.8
  },
  mythic: {
    weight: 40,    // 0.4%
    valueMultiplier: 1000,
    particleCount: 20,
    glowIntensity: 1.0
  },
  cosmic: {
    weight: 10,    // 0.1%
    valueMultiplier: 10000,
    particleCount: 30,
    glowIntensity: 1.2
  }
} as const;

/**
 * Export all configuration as a single object
 */
export const FISH_CONFIG = {
  patterns: PATTERNS,
  mutations: MUTATIONS,
  traits: SPECIAL_TRAITS,
  palettes: COLOR_PALETTES,
  animations: ANIMATIONS,
  rarity: RARITY_CONFIG
} as const;

/**
 * Type exports
 */
export type PatternType = keyof typeof PATTERNS;
export type MutationType = keyof typeof MUTATIONS;
export type TraitType = keyof typeof SPECIAL_TRAITS;
export type PaletteType = keyof typeof COLOR_PALETTES;
export type RarityType = keyof typeof RARITY_CONFIG;
