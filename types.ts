export type AppMode = 'TREE' | 'EXPLODE' | 'CHAOS';

export interface ParticleData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: [number, number, number]; // RGB
  speed: number;
  phase: number;
  type: 'leaf' | 'ornament';
  id: number;
}

export interface PhotoData {
  id: number;
  url: string;
  position: [number, number, number]; // Tree position
  rotation: [number, number, number];
}

export interface GestureState {
  isFist: boolean;      // Trigger Formed/Tree
  isOpenHand: boolean;  // Trigger Explode (generic)
  isSpread: boolean;    // Trigger Chaos
  isPinching: boolean;  // Trigger Focus
  isDoublePinch: boolean;
  handX: number; // -1 to 1 (Rotation)
  handY: number; // -1 to 1 (Zoom)
  cursorX: number; // Screen coords
  cursorY: number;
}

export const THEME = {
  colors: {
    bg: '#050103',
    particlePink: '#FF69B4', // Hot Pink
    particleBlue: '#00BFFF', // Deep Sky Blue
    starGold: '#F0E68C',     // Khaki/Light Gold
    accent: '#FF1493',
  }
};