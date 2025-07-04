/**
 * FishSpeciesCatalog.ts
 * 
 * Comprehensive catalog of all fish species with unique characteristics
 * 
 * @version 1.0.0
 * @path app/lib/FishSpeciesCatalog.ts
 */

import { FishTemplate } from './ArtisticFishPixi';

/**
 * Complete fish species catalog organized by category
 */
export const FISH_SPECIES_CATALOG: Record<string, FishTemplate> = {
  // === TROPICAL FISH ===
  goldfish: {
    name: 'goldfish',
    displayName: 'Golden Koi',
    description: 'Elegant flowing fins with shimmer',
    bodyShape: 'round',
    baseColors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FF6347'
    },
    features: {
      bodyRatio: { w: 1.2, h: 1.0 },
      headCurve: 'round',
      tailType: 'double_fan',
      finStyle: 'flowing',
      special: ['shimmer_scales']
    }
  },
  
  neonTetra: {
    name: 'neonTetra',
    displayName: 'Neon Spirit',
    description: 'Electric blue stripe glowing',
    bodyShape: 'streamlined',
    baseColors: {
      primary: '#00CED1',
      secondary: '#FF1493',
      accent: '#00FFFF'
    },
    features: {
      bodyRatio: { w: 2.0, h: 0.6 },
      headCurve: 'pointed',
      tailType: 'forked',
      finStyle: 'minimal',
      special: ['neon_stripe', 'glow_in_dark']
    }
  },
  
  angelfish: {
    name: 'angelfish',
    displayName: 'Royal Angel',
    description: 'Majestic triangular beauty',
    bodyShape: 'diamond',
    baseColors: {
      primary: '#FFE4B5',
      secondary: '#FF8C00',
      accent: '#000000'
    },
    features: {
      bodyRatio: { w: 0.8, h: 1.5 },
      headCurve: 'angular',
      tailType: 'trailing',
      finStyle: 'elongated',
      special: ['vertical_stripes', 'crown_fins']
    }
  },
  
  clownfish: {
    name: 'clownfish',
    displayName: 'Coral Jester',
    description: 'Playful orange with white bands',
    bodyShape: 'oval',
    baseColors: {
      primary: '#FF4500',
      secondary: '#FFFFFF',
      accent: '#000000'
    },
    features: {
      bodyRatio: { w: 1.0, h: 0.8 },
      headCurve: 'blunt',
      tailType: 'round',
      finStyle: 'standard',
      special: ['white_bands', 'wiggle_swim']
    }
  },
  
  butterflyfish: {
    name: 'butterflyfish',
    displayName: 'Painted Butterfly',
    description: 'Delicate patterns like wings',
    bodyShape: 'compressed',
    baseColors: {
      primary: '#FFFF00',
      secondary: '#000000',
      accent: '#FFFFFF'
    },
    features: {
      bodyRatio: { w: 0.9, h: 1.1 },
      headCurve: 'pointed',
      tailType: 'fan',
      finStyle: 'delicate',
      special: ['eye_spot', 'chevron_pattern']
    }
  },
  
  // === PREDATOR FISH ===
  crystalShark: {
    name: 'crystalShark',
    displayName: 'Crystal Predator',
    description: 'Transparent apex hunter',
    bodyShape: 'streamlined',
    baseColors: {
      primary: '#E0FFFF',
      secondary: '#87CEEB',
      accent: '#4682B4'
    },
    features: {
      bodyRatio: { w: 3.0, h: 0.8 },
      headCurve: 'sharp',
      tailType: 'crescent',
      finStyle: 'blade',
      special: ['translucent_body', 'razor_teeth', 'predator_eyes']
    }
  },
  
  barracuda: {
    name: 'barracuda',
    displayName: 'Silver Torpedo',
    description: 'Lightning-fast hunter',
    bodyShape: 'elongated',
    baseColors: {
      primary: '#C0C0C0',
      secondary: '#708090',
      accent: '#000000'
    },
    features: {
      bodyRatio: { w: 4.0, h: 0.5 },
      headCurve: 'torpedo',
      tailType: 'forked',
      finStyle: 'minimal',
      special: ['speed_lines', 'metallic_sheen']
    }
  },
  
  lionfish: {
    name: 'lionfish',
    displayName: 'Venomous Beauty',
    description: 'Deadly spines with grace',
    bodyShape: 'round',
    baseColors: {
      primary: '#8B0000',
      secondary: '#FFFFFF',
      accent: '#FF6347'
    },
    features: {
      bodyRatio: { w: 1.2, h: 1.0 },
      headCurve: 'broad',
      tailType: 'fan',
      finStyle: 'venomous_spines',
      special: ['poison_spines', 'zebra_stripes', 'float_hover']
    }
  },
  
  // === DEEP SEA FISH ===
  anglerfish: {
    name: 'anglerfish',
    displayName: 'Abyssal Angler',
    description: 'Lure glowing in darkness',
    bodyShape: 'bulbous',
    baseColors: {
      primary: '#2F4F4F',
      secondary: '#000000',
      accent: '#00FF00'
    },
    features: {
      bodyRatio: { w: 1.5, h: 1.3 },
      headCurve: 'massive_jaw',
      tailType: 'small',
      finStyle: 'stubby',
      special: ['bioluminescent_lure', 'giant_mouth', 'scary_teeth']
    }
  },
  
  lanternfish: {
    name: 'lanternfish',
    displayName: 'Deep Glow',
    description: 'Tiny lights in the abyss',
    bodyShape: 'streamlined',
    baseColors: {
      primary: '#191970',
      secondary: '#00CED1',
      accent: '#7FFFD4'
    },
    features: {
      bodyRatio: { w: 1.8, h: 0.6 },
      headCurve: 'round',
      tailType: 'forked',
      finStyle: 'standard',
      special: ['photophores', 'deep_sea_glow']
    }
  },
  
  // === EXOTIC FISH ===
  voidAngel: {
    name: 'voidAngel',
    displayName: 'Void Angel',
    description: 'Darkness incarnate',
    bodyShape: 'diamond',
    baseColors: {
      primary: '#000000',
      secondary: '#330066',
      accent: '#9900FF'
    },
    features: {
      bodyRatio: { w: 0.8, h: 1.5 },
      headCurve: 'ethereal',
      tailType: 'flowing',
      finStyle: 'shadow',
      special: ['void_portal', 'dark_aura', 'phase_shift']
    }
  },
  
  seahorse: {
    name: 'seahorse',
    displayName: 'Ocean Knight',
    description: 'Armored elegance',
    bodyShape: 'serpentine',
    baseColors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#FF1493'
    },
    features: {
      bodyRatio: { w: 0.5, h: 2.0 },
      headCurve: 'horse',
      tailType: 'prehensile',
      finStyle: 'dorsal_only',
      special: ['armor_plates', 'curled_tail', 'upright_swim']
    }
  },
  
  mandarinfish: {
    name: 'mandarinfish',
    displayName: 'Psychedelic Mandarin',
    description: 'Living artwork',
    bodyShape: 'oval',
    baseColors: {
      primary: '#0000FF',
      secondary: '#FF4500',
      accent: '#00FF00'
    },
    features: {
      bodyRatio: { w: 1.2, h: 0.8 },
      headCurve: 'round',
      tailType: 'fan',
      finStyle: 'ornate',
      special: ['maze_pattern', 'psychedelic_colors', 'toxic_mucus']
    }
  },
  
  // === FLATFISH ===
  flounder: {
    name: 'flounder',
    displayName: 'Sand Mimic',
    description: 'Master of camouflage',
    bodyShape: 'flat',
    baseColors: {
      primary: '#DEB887',
      secondary: '#D2691E',
      accent: '#8B4513'
    },
    features: {
      bodyRatio: { w: 1.5, h: 0.3 },
      headCurve: 'flat',
      tailType: 'rounded',
      finStyle: 'frilled',
      special: ['both_eyes_top', 'sand_texture', 'camouflage']
    }
  },
  
  stingray: {
    name: 'stingray',
    displayName: 'Ocean Glider',
    description: 'Graceful carpet of the sea',
    bodyShape: 'flat',
    baseColors: {
      primary: '#696969',
      secondary: '#A9A9A9',
      accent: '#000000'
    },
    features: {
      bodyRatio: { w: 2.0, h: 0.2 },
      headCurve: 'merged',
      tailType: 'whip',
      finStyle: 'wing',
      special: ['wing_flap', 'venomous_barb', 'sand_hide']
    }
  },
  
  // === UNIQUE SHAPES ===
  boxfish: {
    name: 'boxfish',
    displayName: 'Cubic Wonder',
    description: 'Swimming dice',
    bodyShape: 'triangular',
    baseColors: {
      primary: '#FFFF00',
      secondary: '#000000',
      accent: '#FFFFFF'
    },
    features: {
      bodyRatio: { w: 1.0, h: 1.0 },
      headCurve: 'boxy',
      tailType: 'tiny',
      finStyle: 'corner',
      special: ['hexagonal_plates', 'polka_dots', 'rigid_body']
    }
  },
  
  pufferfish: {
    name: 'pufferfish',
    displayName: 'Spiky Balloon',
    description: 'Inflatable defense',
    bodyShape: 'round',
    baseColors: {
      primary: '#F0E68C',
      secondary: '#8B4513',
      accent: '#000000'
    },
    features: {
      bodyRatio: { w: 1.0, h: 1.0 },
      headCurve: 'round',
      tailType: 'small',
      finStyle: 'tiny',
      special: ['inflatable', 'spikes', 'toxic', 'googly_eyes']
    }
  },
  
  // === LEGENDARY FISH ===
  cosmicWhale: {
    name: 'cosmicWhale',
    displayName: 'Cosmic Leviathan',
    description: 'Born from stardust',
    bodyShape: 'massive',
    baseColors: {
      primary: '#191970',
      secondary: '#4B0082',
      accent: '#8A2BE2',
      glow: '#9400D3'
    },
    features: {
      bodyRatio: { w: 3.5, h: 1.8 },
      headCurve: 'majestic',
      tailType: 'cosmic_fluke',
      finStyle: 'ethereal',
      special: ['starfield_skin', 'nebula_breath', 'space_warp', 'ancient_song']
    }
  },
  
  ancientDragon: {
    name: 'ancientDragon',
    displayName: 'Dragon Koi',
    description: 'Mythical Eastern dragon',
    bodyShape: 'serpentine',
    baseColors: {
      primary: '#FF0000',
      secondary: '#FFD700',
      accent: '#FFFF00'
    },
    features: {
      bodyRatio: { w: 4.0, h: 1.0 },
      headCurve: 'dragon',
      tailType: 'legendary',
      finStyle: 'ancient',
      special: ['dragon_whiskers', 'fire_breath', 'pearl_holder', 'scale_shimmer']
    }
  },
  
  phoenixfish: {
    name: 'phoenixfish',
    displayName: 'Phoenix of the Seas',
    description: 'Reborn from coral ashes',
    bodyShape: 'crescent',
    baseColors: {
      primary: '#FF4500',
      secondary: '#FFD700',
      accent: '#FF0000'
    },
    features: {
      bodyRatio: { w: 1.5, h: 1.2 },
      headCurve: 'noble',
      tailType: 'phoenix_plume',
      finStyle: 'flame',
      special: ['fire_trail', 'rebirth_aura', 'healing_presence', 'ash_particles']
    }
  },
  
  prismaticJelly: {
    name: 'prismaticJelly',
    displayName: 'Prismatic Jellyfish',
    description: 'Light-bending ethereal beauty',
    bodyShape: 'bulbous',
    baseColors: {
      primary: '#FFFFFF',
      secondary: '#00FFFF',
      accent: '#FF00FF'
    },
    features: {
      bodyRatio: { w: 1.0, h: 1.5 },
      headCurve: 'bell',
      tailType: 'tentacles',
      finStyle: 'none',
      special: ['translucent', 'rainbow_refraction', 'pulsing_motion', 'electric_tentacles']
    }
  },
  
  // === MECHANICAL/CYBER FISH ===
  cyberPike: {
    name: 'cyberPike',
    displayName: 'Cyber Pike X-99',
    description: 'Augmented predator',
    bodyShape: 'streamlined',
    baseColors: {
      primary: '#1C1C1C',
      secondary: '#00FF00',
      accent: '#FF0000'
    },
    features: {
      bodyRatio: { w: 3.2, h: 0.7 },
      headCurve: 'angular',
      tailType: 'propeller',
      finStyle: 'mechanical',
      special: ['led_eyes', 'circuit_pattern', 'laser_sight', 'turbo_boost']
    }
  },
  
  // === SPECIAL EVENT FISH ===
  goldenLuck: {
    name: 'goldenLuck',
    displayName: 'Fortune Fish',
    description: 'Brings prosperity',
    bodyShape: 'round',
    baseColors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FF0000'
    },
    features: {
      bodyRatio: { w: 1.3, h: 1.0 },
      headCurve: 'noble',
      tailType: 'coin',
      finStyle: 'ornate',
      special: ['coin_scales', 'fortune_aura', 'gold_trail', 'lucky_charm']
    }
  },
  
  icebergTitan: {
    name: 'icebergTitan',
    displayName: 'Arctic Titan',
    description: 'Frozen depths ruler',
    bodyShape: 'massive',
    baseColors: {
      primary: '#87CEEB',
      secondary: '#4682B4',
      accent: '#FFFFFF'
    },
    features: {
      bodyRatio: { w: 2.5, h: 1.5 },
      headCurve: 'blunt',
      tailType: 'powerful',
      finStyle: 'icy',
      special: ['frost_armor', 'ice_breath', 'freeze_aura', 'crystal_spikes']
    }
  }
};

/**
 * Get fish species by category
 */
export function getFishByCategory(category: string): FishTemplate[] {
  const categories: Record<string, string[]> = {
    tropical: ['goldfish', 'neonTetra', 'angelfish', 'clownfish', 'butterflyfish'],
    predator: ['crystalShark', 'barracuda', 'lionfish'],
    deepSea: ['anglerfish', 'lanternfish'],
    exotic: ['voidAngel', 'seahorse', 'mandarinfish'],
    flat: ['flounder', 'stingray'],
    unique: ['boxfish', 'pufferfish'],
    legendary: ['cosmicWhale', 'ancientDragon', 'phoenixfish', 'prismaticJelly'],
    special: ['cyberPike', 'goldenLuck', 'icebergTitan']
  };
  
  const speciesNames = categories[category] || [];
  return speciesNames.map(name => FISH_SPECIES_CATALOG[name]).filter(Boolean);
}

/**
 * Get random fish from catalog
 */
export function getRandomFishSpecies(): FishTemplate {
  const allSpecies = Object.values(FISH_SPECIES_CATALOG);
  return allSpecies[Math.floor(Math.random() * allSpecies.length)];
}

/**
 * Get fish by rarity tier
 */
export function getFishByRarity(minRarity: string): string[] {
  const rarityTiers: Record<string, string[]> = {
    common: ['goldfish', 'neonTetra', 'clownfish', 'flounder'],
    uncommon: ['angelfish', 'butterflyfish', 'seahorse', 'boxfish'],
    rare: ['crystalShark', 'barracuda', 'lionfish', 'mandarinfish'],
    epic: ['voidAngel', 'anglerfish', 'stingray', 'pufferfish'],
    legendary: ['cosmicWhale', 'ancientDragon', 'cyberPike'],
    mythic: ['phoenixfish', 'prismaticJelly', 'icebergTitan'],
    cosmic: ['goldenLuck'] // Ultra rare event fish
  };
  
  return rarityTiers[minRarity] || [];
}
