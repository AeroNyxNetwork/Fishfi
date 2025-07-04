/**
 * pixi.d.ts
 * 
 * Type declarations for PIXI.js v8 extensions
 * 
 * @version 1.0.0
 * @path app/types/pixi.d.ts
 */

import * as PIXI from 'pixi.js';

declare module 'pixi.js' {
  interface Container {
    name?: string;
  }
  
  interface Graphics {
    velocity?: { x: number; y: number };
  }
}

// Extend window for development
declare global {
  interface Window {
    PIXI?: typeof PIXI;
    __PIXI_APP__?: PIXI.Application;
  }
}
