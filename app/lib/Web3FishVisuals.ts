import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

// Premium Web3 Fish Visual System
export class Web3FishVisuals {
  
  // Modern fish silhouettes with Web3 aesthetics
  public static readonly FISH_TEMPLATES = {
    // Crypto Minnow - Common
    cryptoMinnow: {
      type: 'common',
      baseValue: 5,
      visual: {
        bodyShape: 'elliptical',
        bodyGradient: [0x00d4ff, 0x0099cc],
        finStyle: 'simple',
        particleType: 'bubbles',
        web3Feature: 'none'
      }
    },
    
    // DeFi Dolphin - Rare
    defiDolphin: {
      type: 'rare',
      baseValue: 50,
      visual: {
        bodyShape: 'streamlined',
        bodyGradient: [0x7b3ff2, 0x2d1b69],
        finStyle: 'curved',
        particleType: 'ethereumGlow',
        web3Feature: 'contractPulse'
      }
    },
    
    // NFT Shark - Epic
    nftShark: {
      type: 'epic',
      baseValue: 200,
      visual: {
        bodyShape: 'aggressive',
        bodyGradient: [0xff6b6b, 0xc44569],
        finStyle: 'sharp',
        particleType: 'nftFragments',
        web3Feature: 'rarityAura'
      }
    },
    
    // Blockchain Whale - Legendary
    blockchainWhale: {
      type: 'legendary',
      baseValue: 1000,
      visual: {
        bodyShape: 'massive',
        bodyGradient: [0xffd93d, 0xf39c12],
        finStyle: 'majestic',
        particleType: 'blockchainData',
        web3Feature: 'hashVisualizer'
      }
    },
    
    // Metaverse Leviathan - Mythic
    metaverseLeviathan: {
      type: 'mythic',
      baseValue: 10000,
      visual: {
        bodyShape: 'ethereal',
        bodyGradient: [0xe056fd, 0x8e44ad, 0x3498db],
        finStyle: 'holographic',
        particleType: 'metaversePortals',
        web3Feature: 'dimensionalShift'
      }
    }
  };

  // Create premium fish with Web3 aesthetics
  public static createWeb3Fish(
    template: keyof typeof Web3FishVisuals.FISH_TEMPLATES,
    size: number = 1
  ): PIXI.Container {
    const fishContainer = new PIXI.Container();
    const config = this.FISH_TEMPLATES[template];
    
    // Create layered visual system
    const layers = {
      aura: new PIXI.Container(),
      shadow: new PIXI.Container(),
      body: new PIXI.Container(),
      details: new PIXI.Container(),
      effects: new PIXI.Container(),
      web3: new PIXI.Container()
    };
    
    // Add layers in correct order
    Object.values(layers).forEach(layer => fishContainer.addChild(layer));
    
    // Build fish components
    this.createAuraLayer(layers.aura, config, size);
    this.createShadowLayer(layers.shadow, config, size);
    this.createBodyLayer(layers.body, config, size);
    this.createDetailLayer(layers.details, config, size);
    this.createEffectsLayer(layers.effects, config, size);
    this.createWeb3Layer(layers.web3, config, size);
    
    // Store config for animations
    (fishContainer as any).config = config;
    (fishContainer as any).layers = layers;
    (fishContainer as any).animationTime = 0;
    
    return fishContainer;
  }
  
  // Create aura layer for rare fish
  private static createAuraLayer(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    if (config.type === 'common') return;
    
    const auraGraphics = new PIXI.Graphics();
    const auraRadius = 80 * size;
    
    // Multi-layered aura effect
    const auraColors: Record<string, number[]> = {
      rare: [0x7b3ff2, 0x5a2fb8],
      epic: [0xff6b6b, 0xff4757],
      legendary: [0xffd93d, 0xffa502],
      mythic: [0xe056fd, 0x8e44ad, 0x3498db]
    };
    
    const colors = auraColors[config.type as string] || [0xffffff];
    
    // Create pulsing aura rings
    colors.forEach((color, index) => {
      const ring = new PIXI.Graphics();
      ring.lineStyle(3, color, 0.3 - index * 0.1);
      ring.drawCircle(0, 0, auraRadius + index * 20);
      ring.filters = [new PIXI.filters.BlurFilter(8)];
      auraGraphics.addChild(ring);
    });
    
    container.addChild(auraGraphics);
  }
  
  // Create dynamic shadow
  private static createShadowLayer(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.3);
    
    // Dynamic shadow shape based on fish type
    const shadowScale: Record<string, { x: number, y: number }> = {
      elliptical: { x: 60, y: 30 },
      streamlined: { x: 80, y: 25 },
      aggressive: { x: 100, y: 35 },
      massive: { x: 150, y: 50 },
      ethereal: { x: 120, y: 40 }
    };
    
    const scale = shadowScale[config.visual.bodyShape as string] || { x: 60, y: 30 };
    shadow.drawEllipse(0, 50 * size, scale.x * size, scale.y * size);
    shadow.endFill();
    
    shadow.filters = [new PIXI.filters.BlurFilter(10)];
    container.addChild(shadow);
  }
  
  // Create sophisticated body with gradients
  private static createBodyLayer(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    const bodyGraphics = new PIXI.Graphics();
    
    // Create gradient mesh for body
    const gradientTexture = this.createGradientTexture(
      config.visual.bodyGradient,
      256,
      256
    );
    
    // Draw fish body shape
    bodyGraphics.beginTextureFill({ texture: gradientTexture });
    
    switch (config.visual.bodyShape) {
      case 'elliptical':
        this.drawEllipticalFish(bodyGraphics, size);
        break;
      case 'streamlined':
        this.drawStreamlinedFish(bodyGraphics, size);
        break;
      case 'aggressive':
        this.drawAggressiveFish(bodyGraphics, size);
        break;
      case 'massive':
        this.drawMassiveFish(bodyGraphics, size);
        break;
      case 'ethereal':
        this.drawEtherealFish(bodyGraphics, size);
        break;
    }
    
    bodyGraphics.endFill();
    
    // Add shimmer effect for higher tier fish
    if (config.type !== 'common') {
      const shimmer = new PIXI.Graphics();
      shimmer.beginFill(0xffffff, 0.2);
      shimmer.drawRect(-5, -50 * size, 10, 100 * size);
      shimmer.endFill();
      shimmer.angle = 30;
      bodyGraphics.addChild(shimmer);
      
      // Animate shimmer
      gsap.to(shimmer, {
        x: 100 * size,
        duration: 3,
        repeat: -1,
        ease: "power2.inOut"
      });
    }
    
    container.addChild(bodyGraphics);
  }
  
  // Add intricate details
  private static createDetailLayer(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    const detailGraphics = new PIXI.Graphics();
    
    // Eye with realistic reflection
    const eyeContainer = new PIXI.Container();
    
    // Eye socket
    const eyeSocket = new PIXI.Graphics();
    eyeSocket.beginFill(0x000000);
    eyeSocket.drawCircle(0, 0, 8 * size);
    eyeSocket.endFill();
    
    // Iris with gradient
    const iris = new PIXI.Graphics();
    const irisColors: Record<string, number> = {
      common: 0x4a90e2,
      rare: 0x9b59b6,
      epic: 0xe74c3c,
      legendary: 0xf1c40f,
      mythic: 0xe056fd
    };
    iris.beginFill(irisColors[config.type as string] || 0x4a90e2);
    iris.drawCircle(0, 0, 6 * size);
    iris.endFill();
    
    // Pupil
    const pupil = new PIXI.Graphics();
    pupil.beginFill(0x000000);
    pupil.drawCircle(0, 0, 3 * size);
    pupil.endFill();
    
    // Eye highlight
    const highlight = new PIXI.Graphics();
    highlight.beginFill(0xffffff, 0.8);
    highlight.drawCircle(-2 * size, -2 * size, 2 * size);
    highlight.endFill();
    
    eyeContainer.addChild(eyeSocket, iris, pupil, highlight);
    eyeContainer.position.set(20 * size, -10 * size);
    
    // Scales pattern for higher tier fish
    if (config.type !== 'common') {
      const scales = this.createScalePattern(config, size);
      detailGraphics.addChild(scales);
    }
    
    // Fins with dynamic movement
    const fins = this.createFins(config.visual.finStyle, size);
    detailGraphics.addChild(fins);
    
    detailGraphics.addChild(eyeContainer);
    container.addChild(detailGraphics);
  }
  
  // Create particle effects layer
  private static createEffectsLayer(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    const particleContainer = new PIXI.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      alpha: true
    });
    
    // Initialize particle system based on type
    const particleSystem = this.createParticleSystem(
      config.visual.particleType,
      size
    );
    
    container.addChild(particleContainer);
    (container as any).particleSystem = particleSystem;
  }
  
  // Create Web3-specific visual elements
  private static createWeb3Layer(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    switch (config.web3Feature) {
      case 'contractPulse':
        this.createContractPulse(container, size);
        break;
      case 'rarityAura':
        this.createRarityIndicator(container, config, size);
        break;
      case 'hashVisualizer':
        this.createHashVisualizer(container, size);
        break;
      case 'dimensionalShift':
        this.createDimensionalEffect(container, size);
        break;
    }
  }
  
  // Helper function to create gradient texture
  private static createGradientTexture(
    colors: number[],
    width: number,
    height: number
  ): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    colors.forEach((color, index) => {
      const stop = index / (colors.length - 1);
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      gradient.addColorStop(stop, `rgb(${r},${g},${b})`);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return PIXI.Texture.from(canvas);
  }
  
  // Fish shape drawing functions
  private static drawEllipticalFish(graphics: PIXI.Graphics, size: number): void {
    graphics.moveTo(60 * size, 0);
    graphics.bezierCurveTo(
      60 * size, -30 * size,
      30 * size, -40 * size,
      -20 * size, -20 * size
    );
    graphics.bezierCurveTo(
      -40 * size, -10 * size,
      -40 * size, 10 * size,
      -20 * size, 20 * size
    );
    graphics.bezierCurveTo(
      30 * size, 40 * size,
      60 * size, 30 * size,
      60 * size, 0
    );
    
    // Tail
    graphics.moveTo(-20 * size, 0);
    graphics.lineTo(-50 * size, -20 * size);
    graphics.lineTo(-45 * size, 0);
    graphics.lineTo(-50 * size, 20 * size);
    graphics.lineTo(-20 * size, 0);
  }
  
  private static drawStreamlinedFish(graphics: PIXI.Graphics, size: number): void {
    // Sleek dolphin-like shape
    graphics.moveTo(80 * size, 0);
    graphics.bezierCurveTo(
      80 * size, -25 * size,
      40 * size, -35 * size,
      -30 * size, -15 * size
    );
    graphics.bezierCurveTo(
      -50 * size, -5 * size,
      -50 * size, 5 * size,
      -30 * size, 15 * size
    );
    graphics.bezierCurveTo(
      40 * size, 35 * size,
      80 * size, 25 * size,
      80 * size, 0
    );
    
    // Elegant tail
    graphics.moveTo(-30 * size, 0);
    graphics.bezierCurveTo(
      -60 * size, -30 * size,
      -70 * size, -25 * size,
      -65 * size, 0
    );
    graphics.bezierCurveTo(
      -70 * size, 25 * size,
      -60 * size, 30 * size,
      -30 * size, 0
    );
  }
  
  private static drawAggressiveFish(graphics: PIXI.Graphics, size: number): void {
    // Sharp, angular shark shape
    graphics.moveTo(100 * size, 0);
    graphics.lineTo(80 * size, -30 * size);
    graphics.lineTo(20 * size, -40 * size);
    graphics.lineTo(-40 * size, -25 * size);
    graphics.lineTo(-60 * size, -10 * size);
    graphics.lineTo(-50 * size, 0);
    graphics.lineTo(-60 * size, 10 * size);
    graphics.lineTo(-40 * size, 25 * size);
    graphics.lineTo(20 * size, 40 * size);
    graphics.lineTo(80 * size, 30 * size);
    graphics.lineTo(100 * size, 0);
    
    // Menacing tail
    graphics.moveTo(-50 * size, 0);
    graphics.lineTo(-80 * size, -35 * size);
    graphics.lineTo(-75 * size, 0);
    graphics.lineTo(-80 * size, 35 * size);
    graphics.lineTo(-50 * size, 0);
  }
  
  private static drawMassiveFish(graphics: PIXI.Graphics, size: number): void {
    // Whale-like proportions
    graphics.moveTo(120 * size, 0);
    graphics.bezierCurveTo(
      120 * size, -50 * size,
      60 * size, -60 * size,
      -40 * size, -40 * size
    );
    graphics.bezierCurveTo(
      -80 * size, -20 * size,
      -80 * size, 20 * size,
      -40 * size, 40 * size
    );
    graphics.bezierCurveTo(
      60 * size, 60 * size,
      120 * size, 50 * size,
      120 * size, 0
    );
    
    // Massive tail
    graphics.moveTo(-40 * size, 0);
    graphics.bezierCurveTo(
      -100 * size, -60 * size,
      -120 * size, -50 * size,
      -110 * size, 0
    );
    graphics.bezierCurveTo(
      -120 * size, 50 * size,
      -100 * size, 60 * size,
      -40 * size, 0
    );
  }
  
  private static drawEtherealFish(graphics: PIXI.Graphics, size: number): void {
    // Flowing, otherworldly shape
    const points: PIXI.Point[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 2;
      const radiusX = 80 * size * (1 + Math.sin(angle * 3) * 0.2);
      const radiusY = 40 * size * (1 + Math.cos(angle * 2) * 0.3);
      points.push(new PIXI.Point(
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY
      ));
    }
    
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
  }
  
  // Create scale pattern overlay
  private static createScalePattern(config: any, size: number): PIXI.Container {
    const scalesContainer = new PIXI.Container();
    const scaleGraphics = new PIXI.Graphics();
    
    // Create hexagonal scale pattern
    const rows = 8;
    const cols = 12;
    const scaleSize = 6 * size;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * scaleSize * 1.5 - (cols * scaleSize * 0.75);
        const y = row * scaleSize * 1.7 - (rows * scaleSize * 0.85) + 
                  (col % 2 ? scaleSize * 0.85 : 0);
        
        // Only draw scales within fish body bounds
        const distance = Math.sqrt(x * x + y * y);
        if (distance < 60 * size) {
          scaleGraphics.lineStyle(1, 0xffffff, 0.2);
          scaleGraphics.drawPolygon([
            x - scaleSize/2, y,
            x - scaleSize/4, y - scaleSize/2,
            x + scaleSize/4, y - scaleSize/2,
            x + scaleSize/2, y,
            x + scaleSize/4, y + scaleSize/2,
            x - scaleSize/4, y + scaleSize/2
          ]);
        }
      }
    }
    
    scalesContainer.addChild(scaleGraphics);
    return scalesContainer;
  }
  
  // Create animated fins
  private static createFins(style: string, size: number): PIXI.Container {
    const finsContainer = new PIXI.Container();
    
    const finStyles: Record<string, any> = {
      simple: {
        dorsal: { width: 20, height: 30, curve: 0.2 },
        pectoral: { width: 30, height: 20, curve: 0.3 },
        tail: { width: 40, height: 60, curve: 0.4 }
      },
      curved: {
        dorsal: { width: 30, height: 40, curve: 0.5 },
        pectoral: { width: 40, height: 25, curve: 0.6 },
        tail: { width: 60, height: 80, curve: 0.7 }
      },
      sharp: {
        dorsal: { width: 25, height: 50, curve: 0.1 },
        pectoral: { width: 45, height: 30, curve: 0.2 },
        tail: { width: 70, height: 100, curve: 0.3 }
      },
      majestic: {
        dorsal: { width: 40, height: 60, curve: 0.8 },
        pectoral: { width: 60, height: 40, curve: 0.9 },
        tail: { width: 100, height: 120, curve: 1.0 }
      },
      holographic: {
        dorsal: { width: 35, height: 55, curve: 0.6 },
        pectoral: { width: 55, height: 35, curve: 0.7 },
        tail: { width: 90, height: 110, curve: 0.8 }
      }
    };
    
    const finConfig = finStyles[style as string] || finStyles.simple;
    
    // Dorsal fin
    const dorsalFin = new PIXI.Graphics();
    dorsalFin.beginFill(0xffffff, 0.3);
    dorsalFin.moveTo(0, 0);
    dorsalFin.bezierCurveTo(
      -finConfig.dorsal.width * size * finConfig.dorsal.curve, -finConfig.dorsal.height * size * 0.5,
      -finConfig.dorsal.width * size * finConfig.dorsal.curve, -finConfig.dorsal.height * size,
      0, -finConfig.dorsal.height * size
    );
    dorsalFin.bezierCurveTo(
      finConfig.dorsal.width * size * finConfig.dorsal.curve, -finConfig.dorsal.height * size,
      finConfig.dorsal.width * size * finConfig.dorsal.curve, -finConfig.dorsal.height * size * 0.5,
      0, 0
    );
    dorsalFin.endFill();
    dorsalFin.position.set(0, -30 * size);
    
    finsContainer.addChild(dorsalFin);
    return finsContainer;
  }
  
  // Create particle system
  private static createParticleSystem(type: string, size: number): any {
    const systems: Record<string, any> = {
      bubbles: {
        texture: this.createBubbleTexture(),
        config: {
          alpha: { start: 0.8, end: 0 },
          scale: { start: 0.1, end: 0.3 },
          speed: { start: 50, end: 100 },
          lifetime: { min: 1, max: 3 },
          frequency: 0.1
        }
      },
      ethereumGlow: {
        texture: this.createEthereumGlowTexture(),
        config: {
          alpha: { start: 1, end: 0 },
          scale: { start: 0.5, end: 1.5 },
          speed: { start: 20, end: 40 },
          lifetime: { min: 2, max: 4 },
          frequency: 0.05
        }
      },
      nftFragments: {
        texture: this.createNFTFragmentTexture(),
        config: {
          alpha: { start: 1, end: 0.3 },
          scale: { start: 0.3, end: 0.8 },
          speed: { start: 30, end: 60 },
          lifetime: { min: 1.5, max: 3.5 },
          frequency: 0.08
        }
      },
      blockchainData: {
        texture: this.createDataStreamTexture(),
        config: {
          alpha: { start: 0.9, end: 0 },
          scale: { start: 0.2, end: 0.6 },
          speed: { start: 80, end: 120 },
          lifetime: { min: 1, max: 2 },
          frequency: 0.02
        }
      },
      metaversePortals: {
        texture: this.createPortalTexture(),
        config: {
          alpha: { start: 0.7, end: 0 },
          scale: { start: 1, end: 2 },
          speed: { start: 10, end: 30 },
          lifetime: { min: 3, max: 5 },
          frequency: 0.15
        }
      }
    };
    
    return systems[type as string] || systems.bubbles;
  }
  
  // Texture creation helpers
  private static createBubbleTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Draw bubble
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(12, 10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    return PIXI.Texture.from(canvas);
  }
  
  private static createEthereumGlowTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Draw Ethereum-inspired diamond shape
    ctx.fillStyle = 'rgba(98, 126, 234, 0.8)';
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(28, 16);
    ctx.lineTo(16, 28);
    ctx.lineTo(4, 16);
    ctx.closePath();
    ctx.fill();
    
    // Inner glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(22, 16);
    ctx.lineTo(16, 22);
    ctx.lineTo(10, 16);
    ctx.closePath();
    ctx.fill();
    
    return PIXI.Texture.from(canvas);
  }
  
  private static createNFTFragmentTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Create pixelated NFT-style fragment
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#6a4c93'];
    const pixelSize = 4;
    
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (Math.random() > 0.3) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    return PIXI.Texture.from(canvas);
  }
  
  private static createDataStreamTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Binary data visualization
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fillRect(6, 1, 20, 30);
    
    // Add "0" or "1" text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.random() > 0.5 ? '1' : '0', 16, 16);
    
    return PIXI.Texture.from(canvas);
  }
  
  private static createPortalTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Swirling portal effect
    const centerX = 32;
    const centerY = 32;
    const maxRadius = 30;
    
    // Create gradient for portal
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, 'rgba(224, 86, 253, 0.8)');
    gradient.addColorStop(0.5, 'rgba(142, 68, 173, 0.6)');
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.3)');
    
    // Draw concentric circles
    for (let i = 0; i < 5; i++) {
      const alpha = 0.8 - (i * 0.15);
      const radius = maxRadius - (i * 6);
      
      ctx.strokeStyle = `rgba(224, 86, 253, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Add spiral effect
    ctx.strokeStyle = 'rgba(224, 86, 253, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
      const r = angle * 3;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    return PIXI.Texture.from(canvas);
  }
  
  // Web3 Visual Effects
  private static createContractPulse(container: PIXI.Container, size: number): void {
    const pulseGraphics = new PIXI.Graphics();
    
    // Create hexagonal smart contract visualization
    const hexSize = 30 * size;
    let pulseScale = 1;
    
    const drawHex = () => {
      pulseGraphics.clear();
      pulseGraphics.lineStyle(2, 0x7b3ff2, 0.8);
      
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * hexSize * pulseScale;
        const y = Math.sin(angle) * hexSize * pulseScale;
        
        if (i === 0) {
          pulseGraphics.moveTo(x, y);
        } else {
          pulseGraphics.lineTo(x, y);
        }
      }
      pulseGraphics.closePath();
    };
    
    // Animate pulse
    gsap.to({ scale: pulseScale }, {
      scale: 1.5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      onUpdate: function() {
        pulseScale = this.targets()[0].scale;
        drawHex();
      }
    });
    
    container.addChild(pulseGraphics);
  }
  
  private static createRarityIndicator(
    container: PIXI.Container,
    config: any,
    size: number
  ): void {
    const rarityBadge = new PIXI.Container();
    
    // Create holographic badge
    const badge = new PIXI.Graphics();
    badge.beginFill(0x000000, 0.7);
    badge.lineStyle(2, this.getRarityColor(config.type), 1);
    badge.drawRoundedRect(-40 * size, -60 * size, 80 * size, 30 * size, 15 * size);
    badge.endFill();
    
    // Rarity text
    const rarityText = new PIXI.Text(config.type.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: 14 * size,
      fill: this.getRarityColor(config.type),
      fontWeight: 'bold'
    });
    rarityText.anchor.set(0.5);
    rarityText.position.set(0, -45 * size);
    
    // Add shimmer effect
    const shimmer = new PIXI.Graphics();
    shimmer.beginFill(0xffffff, 0.3);
    shimmer.drawRect(0, -60 * size, 5 * size, 30 * size);
    shimmer.endFill();
    shimmer.x = -40 * size;
    
    gsap.to(shimmer, {
      x: 40 * size,
      duration: 3,
      repeat: -1,
      ease: "none"
    });
    
    rarityBadge.addChild(badge, shimmer, rarityText);
    container.addChild(rarityBadge);
  }
  
  private static createHashVisualizer(container: PIXI.Container, size: number): void {
    const hashContainer = new PIXI.Container();
    
    // Create blockchain hash visualization
    const hashBlocks: PIXI.Graphics[] = [];
    const blockCount = 8;
    
    for (let i = 0; i < blockCount; i++) {
      const block = new PIXI.Graphics();
      block.beginFill(0xffd93d, 0.6);
      block.drawRect(0, 0, 15 * size, 15 * size);
      block.endFill();
      
      block.position.set(
        (i - blockCount/2) * 20 * size,
        Math.sin(i * 0.5) * 10 * size
      );
      
      hashBlocks.push(block);
      hashContainer.addChild(block);
    }
    
    // Animate blocks
    hashBlocks.forEach((block, index) => {
      gsap.to(block, {
        alpha: 0.2,
        duration: 1,
        delay: index * 0.1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    });
    
    container.addChild(hashContainer);
  }
  
  private static createDimensionalEffect(container: PIXI.Container, size: number): void {
    const dimensionContainer = new PIXI.Container();
    
    // Create reality distortion effect
    const distortionRings: PIXI.Graphics[] = [];
    
    for (let i = 0; i < 5; i++) {
      const ring = new PIXI.Graphics();
      ring.lineStyle(2, 0xe056fd, 0.5 - i * 0.1);
      ring.drawCircle(0, 0, (50 + i * 20) * size);
      
      // Apply displacement filter for distortion
      const displacementSprite = PIXI.Sprite.from(this.createNoiseTexture());
      displacementSprite.anchor.set(0.5);
      displacementSprite.scale.set(2);
      
      const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
      displacementFilter.scale.x = 20;
      displacementFilter.scale.y = 20;
      
      ring.filters = [displacementFilter];
      
      distortionRings.push(ring);
      dimensionContainer.addChild(ring);
      dimensionContainer.addChild(displacementSprite);
      
      // Animate distortion
      gsap.to(displacementSprite, {
        rotation: Math.PI * 2,
        duration: 10 + i * 2,
        repeat: -1,
        ease: "none"
      });
    }
    
    container.addChild(dimensionContainer);
  }
  
  private static createNoiseTexture(): PIXI.Texture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;     // red
      data[i + 1] = value; // green
      data[i + 2] = value; // blue
      data[i + 3] = 255;   // alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    return PIXI.Texture.from(canvas);
  }
  
  private static getRarityColor(rarity: string): number {
    const colors: Record<string, number> = {
      common: 0x00d4ff,
      rare: 0x7b3ff2,
      epic: 0xff6b6b,
      legendary: 0xffd93d,
      mythic: 0xe056fd
    };
    return colors[rarity as string] || 0xffffff;
  }
  
  // Advanced animation system
  public static animateFish(fish: PIXI.Container, deltaTime: number): void {
    const config = (fish as any).config;
    const layers = (fish as any).layers;
    let animTime = (fish as any).animationTime || 0;
    animTime += deltaTime;
    (fish as any).animationTime = animTime;
    
    // Body swimming motion
    if (layers.body) {
      layers.body.rotation = Math.sin(animTime * 0.002) * 0.1;
      layers.body.scale.x = 1 + Math.sin(animTime * 0.003) * 0.02;
    }
    
    // Fin animations
    if (layers.details) {
      const fins = layers.details.children;
      fins.forEach((fin, index) => {
        if (fin instanceof PIXI.Graphics) {
          fin.rotation = Math.sin(animTime * 0.004 + index) * 0.2;
        }
      });
    }
    
    // Shadow dynamics
    if (layers.shadow) {
      layers.shadow.scale.x = 1 + Math.sin(animTime * 0.001) * 0.1;
      layers.shadow.alpha = 0.3 + Math.sin(animTime * 0.002) * 0.1;
    }
    
    // Particle emission
    if (layers.effects && (layers.effects as any).particleSystem) {
      this.updateParticles(layers.effects, deltaTime);
    }
    
    // Web3 effect updates
    if (layers.web3 && config.web3Feature === 'dimensionalShift') {
      layers.web3.rotation += 0.001 * deltaTime;
    }
  }
  
  private static updateParticles(container: PIXI.Container, deltaTime: number): void {
    // Particle system update logic
    const system = (container as any).particleSystem;
    if (!system) return;
    
    // Emit new particles based on frequency
    if (Math.random() < system.config.frequency) {
      const particle = new PIXI.Sprite(system.texture);
      particle.anchor.set(0.5);
      particle.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      particle.scale.set(system.config.scale.start);
      particle.alpha = system.config.alpha.start;
      
      const velocity = {
        x: (Math.random() - 0.5) * system.config.speed.start,
        y: -Math.random() * system.config.speed.start
      };
      
      (particle as any).velocity = velocity;
      (particle as any).lifetime = system.config.lifetime.min + 
        Math.random() * (system.config.lifetime.max - system.config.lifetime.min);
      (particle as any).age = 0;
      
      container.addChild(particle);
    }
    
    // Update existing particles
    container.children.forEach((child, index) => {
      if (child instanceof PIXI.Sprite && (child as any).velocity) {
        const particle = child;
        const age = (particle as any).age || 0;
        const lifetime = (particle as any).lifetime || 1;
        const velocity = (particle as any).velocity;
        
        // Update position
        particle.x += velocity.x * deltaTime * 0.01;
        particle.y += velocity.y * deltaTime * 0.01;
        
        // Update age
        (particle as any).age = age + deltaTime * 0.001;
        
        // Update properties based on age
        const ageRatio = age / lifetime;
        particle.alpha = system.config.alpha.start + 
          (system.config.alpha.end - system.config.alpha.start) * ageRatio;
        particle.scale.set(
          system.config.scale.start + 
          (system.config.scale.end - system.config.scale.start) * ageRatio
        );
        
        // Remove dead particles
        if (age >= lifetime) {
          container.removeChild(particle);
        }
      }
    });
  }
}
