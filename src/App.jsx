import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Download,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Sparkles,
  Layers,
  Palette as PaletteIcon
} from "lucide-react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

// ==========================================
// PALETTES & THEMES
// ==========================================
const PALETTES = {
  obsidian: {
    id: "obsidian",
    name: "Dark Obsidian",
    bg: "#09090b",
    stroke: "#F5F3EE",
    accent: "#E4E4E7",
    textMuted: "#71717A",
    axis: "rgba(255, 255, 255, 0.4)",
  },
  bauhaus: {
    id: "bauhaus",
    name: "Bauhaus Archive",
    bg: "#F4EFEA",
    stroke: "#18181B",
    accent: "#DC2626",
    textMuted: "#78716C",
    axis: "rgba(220, 38, 38, 0.55)",
  },
  cyanotype: {
    id: "cyanotype",
    name: "Cyanotype Blue",
    bg: "#081325",
    stroke: "#E0F2FE",
    accent: "#38BDF8",
    textMuted: "#0284C7",
    axis: "rgba(56, 189, 248, 0.45)",
  },
  blueprint: {
    id: "blueprint",
    name: "Technical Blueprint",
    bg: "#0F2942",
    stroke: "#67E8F9",
    accent: "#FDE047",
    textMuted: "#38BDF8",
    axis: "rgba(103, 232, 249, 0.5)",
  },
  ivory: {
    id: "ivory",
    name: "Titanium Ivory",
    bg: "#FAFAFA",
    stroke: "#09090B",
    accent: "#52525B",
    textMuted: "#A1A1AA",
    axis: "rgba(9, 9, 11, 0.35)",
  },
  emerald: {
    id: "emerald",
    name: "Forest Slate",
    bg: "#0A1412",
    stroke: "#E2E8F0",
    accent: "#34D399",
    textMuted: "#0D9488",
    axis: "rgba(52, 211, 153, 0.45)",
  },
};

// ==========================================
// PRESETS & FORM RECIPES
// ==========================================
const BASE_WAVE_SETTINGS = {
  frequency: 5.5,
  amplitude: 0.75,
  lineCount: 30,
  spread: 0.16,
  phaseSpread: 1.1,
  damping: 0,
  secondaryMix: 0.3,
  secondaryFrequency: 8,
  secondaryPhase: 1.2,
  symmetry: 0.5,
  directionBias: 0,
  focalCompression: 0.3,
  axisLine: false,
  thickness: 1.1,
  opacity: 0.8,
  scale: 0.88,
  yOffset: 0,
  xPadding: 0.07,
  lineJitter: 0.05,
  bandSoftening: 0.2,
  densityLimit: 0,
  occlusion: false,
  occlusionDepth: 0.65,
};

const PRESETS = {
  decay: {
    ...BASE_WAVE_SETTINGS,
    mode: "decay",
    frequency: 6.5,
    amplitude: 0.82,
    lineCount: 32,
    spread: 0.18,
    damping: 2.9,
    secondaryMix: 0.24,
    secondaryFrequency: 10,
    directionBias: -0.45,
    focalCompression: 0.2,
    occlusion: true,
    occlusionDepth: 0.7,
  },
  standing: {
    ...BASE_WAVE_SETTINGS,
    mode: "standing",
    frequency: 2.0,
    amplitude: 0.68,
    lineCount: 28,
    spread: 0.12,
    phaseSpread: 0.6,
    symmetry: 0.96,
    focalCompression: 0.25,
    occlusion: true,
    occlusionDepth: 0.75,
  },
  interference: {
    ...BASE_WAVE_SETTINGS,
    mode: "interference",
    frequency: 3.4,
    amplitude: 0.6,
    lineCount: 28,
    spread: 0.22,
    phaseSpread: 1.6,
    secondaryMix: 0.72,
    secondaryFrequency: 5.1,
    focalCompression: 0.45,
    occlusion: false,
  },
  resonance: {
    ...BASE_WAVE_SETTINGS,
    mode: "resonance",
    frequency: 5.8,
    amplitude: 0.84,
    lineCount: 36,
    spread: 0.16,
    secondaryMix: 0.42,
    secondaryFrequency: 8.2,
    symmetry: 0.85,
    focalCompression: 0.75,
    occlusion: true,
    occlusionDepth: 0.8,
  },
  fm: {
    ...BASE_WAVE_SETTINGS,
    mode: "fm",
    frequency: 4.2,
    amplitude: 0.78,
    lineCount: 34,
    spread: 0.15,
    phaseSpread: 1.4,
    secondaryMix: 0.65,
    secondaryFrequency: 9.6,
    secondaryPhase: 0.8,
    symmetry: 0.4,
    focalCompression: 0.5,
    occlusion: true,
    occlusionDepth: 0.7,
  },
  harmonograph: {
    ...BASE_WAVE_SETTINGS,
    mode: "harmonograph",
    frequency: 3.0,
    amplitude: 0.7,
    lineCount: 26,
    spread: 0.2,
    phaseSpread: 1.25,
    damping: 1.4,
    secondaryMix: 0.5,
    secondaryFrequency: 4.0,
    secondaryPhase: 1.57,
    symmetry: 0.6,
    scale: 0.76,
    occlusion: false,
  },
  chladni: {
    ...BASE_WAVE_SETTINGS,
    mode: "chladni",
    frequency: 4.0,
    amplitude: 0.7,
    lineCount: 32,
    spread: 0.14,
    phaseSpread: 0.8,
    secondaryMix: 0.6,
    secondaryFrequency: 6.0,
    symmetry: 0.9,
    focalCompression: 0.4,
    occlusion: true,
    occlusionDepth: 0.75,
  },
  orbital: {
    ...BASE_WAVE_SETTINGS,
    mode: "orbital",
    frequency: 2.5,
    amplitude: 0.62,
    lineCount: 30,
    spread: 0.18,
    phaseSpread: 1.2,
    secondaryMix: 0.45,
    secondaryFrequency: 4.0,
    secondaryPhase: 1.57,
    symmetry: 0.58,
    scale: 0.78,
    occlusion: false,
  },
  vortex: {
    mode: "vortex",
    spiralTurns: 9.2,
    spiralGrowth: 2.9,
    centerPull: 0.82,
    innerVoid: 0.04,
    ellipse: 0.14,
    angularOffset: 0.36,
    radialLineCount: 40,
    densityBias: "center",
    radialSpread: 0.24,
    rotation: 0.22,
    axisLine: false,
    thickness: 0.9,
    opacity: 0.75,
    scale: 0.78,
    yOffset: 0,
  },
};

const SPIRAL_PROFILES = {
  vortex: { ...PRESETS.vortex },
  open: {
    spiralTurns: 4.8,
    spiralGrowth: 1.35,
    centerPull: 0.3,
    innerVoid: 0.22,
    ellipse: 0.18,
    angularOffset: 0.22,
    radialLineCount: 24,
    densityBias: "even",
    radialSpread: 0.12,
    rotation: 0.08,
    thickness: 0.92,
    opacity: 0.68,
    scale: 0.86,
    yOffset: 0,
  },
  shell: {
    spiralTurns: 6.6,
    spiralGrowth: 1.8,
    centerPull: 0.44,
    innerVoid: 0.12,
    ellipse: 0.28,
    angularOffset: 0.28,
    radialLineCount: 32,
    densityBias: "outer",
    radialSpread: 0.18,
    rotation: 0.14,
    thickness: 0.88,
    opacity: 0.72,
    scale: 0.84,
    yOffset: 0,
  },
};

const PRESET_LIBRARY = [
  { id: "harmonic-resonance-ridge", name: "Resonance Ridge (3D)", category: "Harmonic Studies", settings: { ...PRESETS.resonance, occlusion: true } },
  { id: "harmonic-standing-chamber", name: "Standing Wave Chamber", category: "Harmonic Studies", settings: { ...PRESETS.standing, symmetry: 0.98, lineCount: 30 } },
  { id: "harmonic-interference-core", name: "Interference Core", category: "Harmonic Studies", settings: { ...PRESETS.interference } },
  { id: "acoustic-fm-timbre", name: "FM Timbre Dispersion", category: "Acoustic Studies", settings: { ...PRESETS.fm } },
  { id: "acoustic-harmonograph-knot", name: "Harmonograph 3:4 Pendulum", category: "Acoustic Studies", settings: { ...PRESETS.harmonograph } },
  { id: "acoustic-chladni-plate", name: "Chladni Modal Plate", category: "Acoustic Studies", settings: { ...PRESETS.chladni } },
  { id: "wave-decay-landscape", name: "Damped Mountain Decay", category: "Wave Studies", settings: { ...PRESETS.decay, lineCount: 38, occlusion: true, damping: 3.2 } },
  { id: "spiral-vortex-study", name: "Vortex Log-Spiral", category: "Spiral Studies", settings: { ...PRESETS.vortex, mode: "vortex" } },
  { id: "spiral-shell-study", name: "Nautilus Shell Curve", category: "Spiral Studies", settings: { ...PRESETS.vortex, ...SPIRAL_PROFILES.shell, mode: "vortex" } },
  { id: "orbital-ribbon-loop", name: "Orbital Knot Ribbon", category: "Orbital Studies", settings: { ...PRESETS.orbital } },
];

const PRESET_BY_ID = Object.fromEntries(PRESET_LIBRARY.map((p) => [p.id, p]));
const PRESET_CATEGORIES = [...new Set(PRESET_LIBRARY.map((p) => p.category))];
const CUSTOM_PRESETS_KEY = "harmonic-form-studio.custom-presets.v2";

const MODE_BOUNDS = {
  decay: {
    frequency: [1.5, 12], amplitude: [0.3, 1.1], lineCount: [14, 52], spread: [0.04, 0.32],
    phaseSpread: [0.2, 2.0], damping: [0.8, 5.0], secondaryMix: [0, 0.8], secondaryFrequency: [2, 16],
    secondaryPhase: [0, TAU], symmetry: [0, 1], directionBias: [-0.8, 0.8], focalCompression: [0, 1],
    thickness: [0.6, 2.0], opacity: [0.3, 1], scale: [0.6, 1.05], yOffset: [-0.3, 0.3], xPadding: [0.02, 0.15],
    lineJitter: [0, 0.4], bandSoftening: [0, 1], occlusionDepth: [0.1, 1],
  },
  standing: {
    frequency: [1, 8], amplitude: [0.3, 1.0], lineCount: [14, 50], spread: [0.02, 0.3],
    phaseSpread: [0.1, 1.8], secondaryMix: [0, 0.6], secondaryFrequency: [1.5, 12], secondaryPhase: [0, TAU],
    symmetry: [0.5, 1], directionBias: [-0.5, 0.5], focalCompression: [0, 1], thickness: [0.6, 2.0],
    opacity: [0.3, 1], scale: [0.6, 1.05], yOffset: [-0.3, 0.3], xPadding: [0.02, 0.15],
    lineJitter: [0, 0.4], bandSoftening: [0, 1], occlusionDepth: [0.1, 1],
  },
  interference: {
    frequency: [1.5, 10], amplitude: [0.3, 1.0], lineCount: [14, 50], spread: [0.04, 0.35],
    phaseSpread: [0.2, 2.4], secondaryMix: [0.1, 0.95], secondaryFrequency: [2, 14], secondaryPhase: [0, TAU],
    symmetry: [0.2, 1], directionBias: [-0.5, 0.5], focalCompression: [0, 1], thickness: [0.6, 2.0],
    opacity: [0.3, 1], scale: [0.6, 1.05], yOffset: [-0.3, 0.3], xPadding: [0.02, 0.15],
    lineJitter: [0, 0.4], bandSoftening: [0, 1], occlusionDepth: [0.1, 1],
  },
  resonance: {
    frequency: [2.5, 12], amplitude: [0.4, 1.15], lineCount: [16, 56], spread: [0.04, 0.28],
    phaseSpread: [0.2, 2.0], secondaryMix: [0.1, 0.8], secondaryFrequency: [3, 16], secondaryPhase: [0, TAU],
    symmetry: [0.4, 1], directionBias: [-0.5, 0.5], focalCompression: [0.2, 1], thickness: [0.6, 2.2],
    opacity: [0.3, 1], scale: [0.6, 1.05], yOffset: [-0.3, 0.3], xPadding: [0.02, 0.15],
    lineJitter: [0, 0.4], bandSoftening: [0, 1], occlusionDepth: [0.1, 1],
  },
  fm: {
    frequency: [1.5, 9], amplitude: [0.3, 1.1], lineCount: [14, 52], spread: [0.04, 0.32],
    phaseSpread: [0.2, 2.2], secondaryMix: [0.1, 1.0], secondaryFrequency: [2, 16], secondaryPhase: [0, TAU],
    symmetry: [0.1, 1], directionBias: [-0.5, 0.5], focalCompression: [0, 1], thickness: [0.6, 2.0],
    opacity: [0.3, 1], scale: [0.6, 1.05], yOffset: [-0.3, 0.3], xPadding: [0.02, 0.15],
    lineJitter: [0, 0.4], bandSoftening: [0, 1], occlusionDepth: [0.1, 1],
  },
  harmonograph: {
    frequency: [1, 8], amplitude: [0.3, 1.0], lineCount: [12, 48], spread: [0.04, 0.35],
    phaseSpread: [0.2, 2.5], damping: [0.2, 3.5], secondaryMix: [0.1, 0.9], secondaryFrequency: [1, 10],
    secondaryPhase: [0, TAU], symmetry: [0.2, 1], thickness: [0.6, 2.0], opacity: [0.3, 1],
    scale: [0.55, 0.95], yOffset: [-0.3, 0.3], lineJitter: [0, 0.4], bandSoftening: [0, 1],
  },
  chladni: {
    frequency: [2, 10], amplitude: [0.3, 1.0], lineCount: [16, 52], spread: [0.04, 0.3],
    phaseSpread: [0.2, 2.0], secondaryMix: [0.2, 0.9], secondaryFrequency: [2, 12], secondaryPhase: [0, TAU],
    symmetry: [0.5, 1], directionBias: [-0.5, 0.5], focalCompression: [0, 1], thickness: [0.6, 2.0],
    opacity: [0.3, 1], scale: [0.6, 1.05], yOffset: [-0.3, 0.3], xPadding: [0.02, 0.15],
    lineJitter: [0, 0.4], bandSoftening: [0, 1], occlusionDepth: [0.1, 1],
  },
  orbital: {
    frequency: [1.2, 6], amplitude: [0.3, 1.0], lineCount: [14, 48], spread: [0.04, 0.32],
    phaseSpread: [0.3, 2.4], secondaryMix: [0.1, 0.85], secondaryFrequency: [1.5, 9], secondaryPhase: [0, TAU],
    symmetry: [0.2, 1], directionBias: [-0.5, 0.5], focalCompression: [0, 1], thickness: [0.6, 2.0],
    opacity: [0.3, 1], scale: [0.55, 0.95], yOffset: [-0.3, 0.3], lineJitter: [0, 0.4], bandSoftening: [0, 1],
  },
  vortex: {
    spiralTurns: [2.5, 13], spiralGrowth: [-0.5, 3.5], centerPull: [0.05, 0.95], innerVoid: [0.01, 0.4],
    ellipse: [0, 0.75], angularOffset: [0.05, 0.65], radialLineCount: [12, 64], radialSpread: [0.05, 0.35],
    rotation: [0, TAU], thickness: [0.5, 1.6], opacity: [0.3, 1], scale: [0.55, 1.0], yOffset: [-0.3, 0.3],
  },
};

const gaussian = (x, mu, sigma) => {
  const safeSigma = Math.max(0.001, sigma);
  const z = (x - mu) / safeSigma;
  return Math.exp(-0.5 * z * z);
};

const hashNoise = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
};

const randomBetween = (min, max) => min + Math.random() * (max - min);
const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];

function mutateSettings(settings, amount = 0.22) {
  const bounds = MODE_BOUNDS[settings.mode] || MODE_BOUNDS.decay;
  const next = { ...settings };
  Object.entries(bounds).forEach(([key, [min, max]]) => {
    const cur = settings[key] ?? (min + max) / 2;
    const delta = (max - min) * amount * (Math.random() - 0.5);
    const val = clamp(cur + delta, min, max);
    next[key] = Number.isInteger(cur) ? Math.round(val) : Number(val.toFixed(3));
  });
  return next;
}

// ==========================================
// GENERATIVE CURVE BUILDERS
// ==========================================
function buildWavePath(settings, lineIndex, width, height, timeOffset = 0, forOcclusion = false) {
  const {
    mode, frequency, amplitude, lineCount, spread, phaseSpread,
    damping = 0, secondaryMix = 0.3, secondaryFrequency = 8, secondaryPhase = 1.2,
    symmetry = 0.5, directionBias = 0, focalCompression = 0.3,
    scale, yOffset = 0, xPadding = 0.07, lineJitter = 0.05, bandSoftening = 0.2,
  } = settings;

  const padX = width * xPadding;
  const usableWidth = width - padX * 2;
  const mid = Math.max(1, (lineCount - 1) / 2);
  const norm = (lineIndex - mid) / mid; // -1 to 1

  // Topographic depth stacking: lines offset downward proportionally to emulate 3D terrain
  const verticalStackSpread = settings.occlusion ? (settings.occlusionDepth * 240 * (scale || 1)) : 0;
  const depthOffset = (lineIndex / Math.max(1, lineCount - 1) - 0.5) * verticalStackSpread;
  const centerY = height / 2 + (yOffset * height * 0.25) + depthOffset;
  const ampPx = amplitude * height * 0.28 * scale;

  const n = 520;
  const softSpread = lerp(spread, spread * 0.35, bandSoftening);
  const softPhaseSpread = lerp(phaseSpread, phaseSpread * 0.35, bandSoftening);
  const phaseOffset = norm * softPhaseSpread + timeOffset;
  const ampOffset = 1 + norm * softSpread;

  const focusCenter = clamp(0.5 + directionBias * 0.25, 0.1, 0.9);
  const focusSigma = lerp(0.35, 0.1, focalCompression);
  const lineNoise = hashNoise(lineIndex + 17) - 0.5;

  let d = "";
  let firstX = 0;
  let firstY = 0;
  let lastX = 0;
  let lastY = 0;

  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const u = t * TAU;
    const jitterEnvelope = Math.sin(Math.PI * t);
    const microJitter = lineJitter * width * 0.015 * Math.sin(t * TAU * 3 + lineNoise * 10) * jitterEnvelope;
    const x = padX + t * usableWidth + microJitter;

    const focusBoost = 1 + focalCompression * gaussian(t, focusCenter, focusSigma) * 1.3;
    let yNorm = 0;

    if (mode === "decay") {
      const decayT = clamp(t + Math.max(0, directionBias) * 0.2, 0, 1);
      const env = Math.exp(-damping * decayT);
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.5);
      yNorm = (w1 + w2) * env * ampOffset * focusBoost;
    } else if (mode === "standing") {
      const mirroredT = 1 - Math.abs(2 * t - 1);
      const structuralT = lerp(t, mirroredT, symmetry);
      const env = Math.sin(Math.PI * structuralT);
      const carrier = Math.sin(frequency * Math.PI * structuralT + phaseOffset);
      const harmonic = secondaryMix * 0.4 * Math.sin(secondaryFrequency * Math.PI * structuralT + secondaryPhase);
      yNorm = env * (carrier + harmonic) * ampOffset * focusBoost;
    } else if (mode === "interference") {
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase - phaseOffset * 0.7);
      yNorm = (w1 + w2) * 0.5 * ampOffset * focusBoost;
    } else if (mode === "resonance") {
      const env =
        0.15 +
        0.4 * gaussian(t, 0.25 + directionBias * 0.05, 0.08) +
        1.15 * gaussian(t, 0.5 + directionBias * 0.05, lerp(0.09, 0.04, focalCompression)) +
        0.65 * gaussian(t, 0.75 + directionBias * 0.05, 0.07);
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.4);
      yNorm = (w1 + w2) * env * ampOffset * focusBoost;
    } else if (mode === "fm") {
      // Frequency Modulation: Carrier phase modulated by modulator wave
      const modulator = Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.5);
      const fmIndex = secondaryMix * 2.8;
      const carrier = Math.sin(frequency * u + phaseOffset + fmIndex * modulator);
      const env = lerp(1, Math.sin(Math.PI * t), symmetry * 0.5);
      yNorm = carrier * env * ampOffset * focusBoost;
    } else if (mode === "chladni") {
      // 2D Chladni modal nodal slice
      const nx = frequency;
      const ny = secondaryFrequency * 0.5;
      const modeA = Math.sin(nx * Math.PI * t) * Math.cos(ny * Math.PI * norm);
      const modeB = Math.sin(ny * Math.PI * t) * Math.cos(nx * Math.PI * norm);
      const val = modeA - secondaryMix * modeB;
      yNorm = val * ampOffset * focusBoost;
    }

    const y = centerY - yNorm * ampPx;
    if (i === 0) {
      firstX = x;
      firstY = y;
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    if (i === n) {
      lastX = x;
      lastY = y;
    }
  }

  if (forOcclusion) {
    const bottomY = height + 40;
    d += ` L ${lastX.toFixed(2)} ${bottomY} L ${firstX.toFixed(2)} ${bottomY} Z`;
  }

  return d;
}

function buildHarmonographPath(settings, lineIndex, width, height, timeOffset = 0) {
  const {
    frequency, amplitude, lineCount, spread, phaseSpread,
    damping = 1.2, secondaryFrequency = 4, secondaryPhase = 1.57,
    scale, yOffset = 0, lineJitter = 0.05,
  } = settings;

  const cx = width / 2;
  const cy = height / 2 + yOffset * height * 0.25;
  const mid = Math.max(1, (lineCount - 1) / 2);
  const norm = (lineIndex - mid) / mid;

  const ampX = width * 0.32 * scale * (1 + norm * spread);
  const ampY = height * 0.32 * scale * (1 + norm * spread);
  const pOffset = norm * phaseSpread + timeOffset;

  let d = "";
  const steps = 950;
  const maxT = 6.0; // Seconds of pendulum decay

  for (let i = 0; i <= steps; i += 1) {
    const s = i / steps;
    const t = s * maxT;
    const env = Math.exp(-damping * 0.3 * t);

    // Lateral and vertical compound pendulums
    const xHarm = Math.sin(frequency * t + pOffset) + 0.45 * Math.sin(secondaryFrequency * 1.5 * t);
    const yHarm = Math.sin(secondaryFrequency * t + secondaryPhase + pOffset * 0.8) + 0.45 * Math.sin(frequency * 0.75 * t);

    const jitter = lineJitter * 8 * (hashNoise(i + lineIndex) - 0.5);
    const x = cx + xHarm * ampX * env + jitter;
    const y = cy + yHarm * ampY * env * amplitude + jitter;

    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildOrbitalPath(settings, lineIndex, width, height, timeOffset = 0) {
  const {
    frequency, amplitude, lineCount, spread, phaseSpread,
    secondaryMix, secondaryFrequency, secondaryPhase,
    symmetry, directionBias, focalCompression,
    scale, yOffset = 0, lineJitter = 0.05,
  } = settings;

  const cx = width / 2 + directionBias * width * 0.08;
  const cy = height / 2 + yOffset * height * 0.25;
  const rx = width * 0.25 * scale;
  const ry = height * 0.22 * scale;
  const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread + timeOffset;
  const sizeOffset = 1 + norm * spread * 0.6;
  const tension = 1 + focalCompression * 0.35;
  const orbitJitter = Math.min(width, height) * 0.015 * lineJitter;

  let d = "";
  const steps = 900;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * TAU;
    const symmetryFold = lerp(1, Math.cos(t * 2), symmetry * 0.25);
    const jitterX = Math.sin(t * 2.3 + norm * 5) * orbitJitter;
    const jitterY = Math.cos(t * 2.0 + norm * 5) * orbitJitter;

    const x = cx +
      rx * sizeOffset * Math.sin(t) +
      rx * 0.35 * secondaryMix * Math.sin(secondaryFrequency * t + secondaryPhase + phaseOffset) +
      jitterX;
    const y = cy +
      ry * sizeOffset * Math.sin(frequency * t + phaseOffset) * amplitude * tension +
      ry * 0.28 * Math.cos(t * (1.4 + symmetry * 0.6) + phaseOffset * 0.4) * symmetryFold +
      jitterY;

    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildSpiralPath(settings, lineIndex, width, height, timeOffset = 0) {
  const {
    spiralTurns, spiralGrowth, centerPull, innerVoid,
    ellipse, angularOffset, radialLineCount, densityBias,
    radialSpread, rotation, scale, yOffset = 0,
  } = settings;

  const cx = width / 2;
  const cy = height / 2 + yOffset * height * 0.24;
  const maxR = Math.min(width, height) * 0.42 * scale;
  const mid = Math.max(1, (radialLineCount - 1) / 2);
  const norm = (lineIndex - mid) / mid;
  const lineScale = 1 + norm * radialSpread;
  const lineRotation = norm * angularOffset * TAU + rotation + timeOffset;
  const yScale = lerp(1, 0.52, ellipse);

  const densityMap = (t) => {
    if (densityBias === "center") return t ** 1.8;
    if (densityBias === "outer") return t ** 0.65;
    return t;
  };

  const growthBase = Math.max(-0.95, spiralGrowth);
  const growthCurve = (t) => {
    if (Math.abs(growthBase) < 0.001) return t;
    if (growthBase > 0) return (Math.exp(growthBase * t) - 1) / (Math.exp(growthBase) - 1);
    const k = Math.abs(growthBase);
    return 1 - ((Math.exp(k * (1 - t)) - 1) / (Math.exp(k) - 1));
  };

  let d = "";
  const steps = 1000;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const densityT = densityMap(t);
    const grownT = growthCurve(densityT);
    const pulledT = grownT ** lerp(0.7, 2.5, centerPull);
    const coreRadius = innerVoid * maxR;
    const radius = (coreRadius + (maxR - coreRadius) * pulledT) * lineScale;
    const angle = grownT * spiralTurns * TAU + lineRotation;

    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle) * yScale;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

// ==========================================
// AUDIO SYNTHESIZER (AUDIFY)
// ==========================================
class HarmonicSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.activeNodes = [];
  }

  init() {
    if (typeof window === "undefined") return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  play(settings) {
    this.init();
    if (!this.ctx) return;

    this.stop();

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.1);
    masterGain.connect(this.ctx.destination);

    const baseFreq = 110 + (settings.frequency || 4) * 24;

    const osc1 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = "sine";
    const secFreq = baseFreq * ((settings.secondaryFrequency || 6) / Math.max(1, settings.frequency || 4));
    osc2.frequency.setValueAtTime(secFreq, now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(clamp(settings.secondaryMix ?? 0.3, 0.05, 0.8), now);

    if (settings.mode === "fm") {
      const modIndex = (settings.secondaryMix ?? 0.5) * 180;
      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(modIndex, now);
      osc2.connect(modGain);
      modGain.connect(osc1.frequency);
      osc1.connect(masterGain);
    } else {
      osc1.connect(masterGain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(masterGain);
    }

    const toneNodes = [osc1, osc2];
    this.activeNodes = [osc1, osc2, osc2Gain, masterGain];

    try {
      osc1.start(now);
      osc2.start(now);
    } catch (error) {
      this.activeNodes.forEach((node) => {
        try {
          node.disconnect();
        } catch {}
      });
      this.activeNodes = [];
      this.isPlaying = false;
      throw error;
    }

    if (settings.mode === "decay" && settings.damping > 0) {
      const decayDuration = Math.max(0.8, 5.0 / settings.damping);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);
      toneNodes.forEach((node) => {
        try {
          node.stop(now + decayDuration + 0.1);
        } catch {}
      });
    } else {
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      toneNodes.forEach((node) => {
        try {
          node.stop(now + 4.0);
        } catch {}
      });
    }

    this.isPlaying = true;
  }

  stop() {
    if (!this.ctx || !this.activeNodes.length) {
      this.isPlaying = false;
      return;
    }

    const nodes = [...this.activeNodes];
    this.activeNodes = [];

    nodes.forEach((node) => {
      try {
        if (node && typeof node.stop === "function") {
          node.stop();
        }
        if (node && typeof node.disconnect === "function") {
          node.disconnect();
        }
      } catch {}
    });

    this.isPlaying = false;
  }
}

const synthInstance = new HarmonicSynth();

// ==========================================
// SVG ART CANVAS COMPONENT
// ==========================================
function HarmonicSvg({
  settings,
  palette,
  aspectRatio = "landscape",
  posterFrame = true,
  timeOffset = 0,
}) {
  const dims = useMemo(() => {
    switch (aspectRatio) {
      case "portrait":
        return { width: 1000, height: 1333 };
      case "square":
        return { width: 1100, height: 1100 };
      case "landscape":
      default:
        return { width: 1400, height: 840 };
    }
  }, [aspectRatio]);

  const { width, height } = dims;

  const curves = useMemo(() => {
    const list = [];
    const isVortex = settings.mode === "vortex";
    const totalLines = isVortex ? settings.radialLineCount : settings.lineCount;

    for (let i = 0; i < totalLines; i += 1) {
      let strokePath = "";
      let fillPath = "";

      if (settings.mode === "orbital") {
        strokePath = buildOrbitalPath(settings, i, width, height, timeOffset);
      } else if (settings.mode === "harmonograph") {
        strokePath = buildHarmonographPath(settings, i, width, height, timeOffset);
      } else if (isVortex) {
        strokePath = buildSpiralPath(settings, i, width, height, timeOffset);
      } else {
        strokePath = buildWavePath(settings, i, width, height, timeOffset, false);
        if (settings.occlusion) {
          fillPath = buildWavePath(settings, i, width, height, timeOffset, true);
        }
      }

      list.push({ id: i, strokePath, fillPath });
    }
    return list;
  }, [settings, width, height, timeOffset]);

  const strokeOpacity = clamp(settings.opacity, 0.05, 1);
  const formulaLabel = useMemo(() => {
    switch (settings.mode) {
      case "decay":
        return `f(t) = e^(-${settings.damping.toFixed(1)}t) · sin(${settings.frequency.toFixed(1)}ωt)`;
      case "standing":
        return `Ψ(x,t) = 2A · sin(k x) · cos(ω t + φ)`;
      case "fm":
        return `y(t) = A · sin[ω_c t + I·sin(ω_m t)]`;
      case "harmonograph":
        return `P(t) = A₁e^(-d₁t)sin(f₁t) ⊗ B₁e^(-d₂t)sin(f₂t)`;
      case "chladni":
        return `W(x,y) = a·sin(nπx)sin(mπy) - b·sin(mπx)sin(nπy)`;
      case "vortex":
        return `r(θ) = r₀ · e^(kθ) ⊗ center_pull:${settings.centerPull.toFixed(2)}`;
      default:
        return `ω₁: ${settings.frequency.toFixed(1)}Hz  ·  ω₂: ${(settings.secondaryFrequency || 0).toFixed(1)}Hz`;
    }
  }, [settings]);

  return (
    <svg
      id="harmonic-poster-svg"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto rounded-3xl shadow-2xl transition-colors duration-300"
      style={{ backgroundColor: palette.bg }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Harmonic form generative art canvas"
      shapeRendering="geometricPrecision"
    >
      <rect x="0" y="0" width={width} height={height} fill={palette.bg} />

      {/* Axis Marker */}
      {settings.axisLine && settings.mode !== "vortex" && (
        <line
          x1={width * 0.08}
          y1={height / 2}
          x2={width * 0.92}
          y2={height / 2}
          stroke={palette.axis}
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
      )}

      {/* Curve Rendering */}
      <g>
        {curves.map((curve, i) => (
          <g key={curve.id}>
            {/* Topographic Occlusion Skirt */}
            {settings.occlusion && curve.fillPath && (
              <path d={curve.fillPath} fill={palette.bg} opacity={1} />
            )}
            {/* Visual Stroke Line */}
            <path
              d={curve.strokePath}
              fill="none"
              stroke={palette.stroke}
              strokeWidth={settings.thickness}
              strokeOpacity={strokeOpacity * (0.45 + (i / Math.max(1, curves.length - 1)) * 0.55)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>

      {/* Swiss Archival Poster Typography Framing */}
      {posterFrame && (
        <g
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={palette.textMuted}
          style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
          fontSize="10"
        >
          {/* Outer Margins & Hairline Border */}
          <rect
            x="24"
            y="24"
            width={width - 48}
            height={height - 48}
            fill="none"
            stroke={palette.stroke}
            strokeWidth="0.75"
            strokeOpacity="0.18"
          />

          {/* Registration Marks (+) */}
          <path
            d={`M 18 24 H 30 M 24 18 V 30 M ${width - 30} 24 H ${width - 18} M ${width - 24} 18 V 30 M 18 ${height - 24} H 30 M 24 ${height - 30} V ${height - 18} M ${width - 30} ${height - 24} H ${width - 18} M ${width - 24} ${height - 30} V ${height - 18}`}
            stroke={palette.accent}
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Header Metadata */}
          <text x="44" y="48" fontWeight="600" fill={palette.accent}>
            STUDIO SERIES // {settings.mode.toUpperCase()}
          </text>
          <text x={width - 44} y="48" textAnchor="end">
            {formulaLabel}
          </text>

          {/* Footer Metadata */}
          <text x="44" y={height - 42}>
            HARMONIC FORM STUDIO · ED. 2026
          </text>
          <text x={width / 2} y={height - 42} textAnchor="middle" fill={palette.stroke} fillOpacity="0.7">
            PLATE № {(Math.abs(settings.frequency * 73) % 900 + 100).toFixed(0)} / {palette.name}
          </text>
          <text x={width - 44} y={height - 42} textAnchor="end">
            VECTOR HARMONIC PLOT
          </text>
        </g>
      )}
    </svg>
  );
}

// ==========================================
// REUSABLE UI CONTROLS
// ==========================================
function Control({ label, value = 0, min, max, step = 0.01, onChange }) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-zinc-300">
        <Label>{label}</Label>
        <span className="tabular-nums text-zinc-500">{safeValue.toFixed(2)}</span>
      </div>
      <Slider
        value={[safeValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 shadow-sm">
      <div className="space-y-1">
        <div className="text-sm font-medium text-zinc-100">{title}</div>
        {description && <p className="text-xs leading-relaxed text-zinc-500">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

// ==========================================
// MAIN STUDIO APPLICATION
// ==========================================
export default function App() {
  const [presetCategory, setPresetCategory] = useState("Harmonic Studies");
  const [preset, setPreset] = useState("harmonic-resonance-ridge");
  const [settings, setSettings] = useState({ ...PRESET_BY_ID["harmonic-resonance-ridge"].settings });
  const [activePaletteKey, setActivePaletteKey] = useState("obsidian");
  const [aspectRatio, setAspectRatio] = useState("landscape");
  const [posterFrame, setPosterFrame] = useState(true);

  // Animation & Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1.0);
  const [isAudifying, setIsAudifying] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);

  const [variationAmount, setVariationAmount] = useState(0.24);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPresets, setCustomPresets] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const isVortexMode = settings.mode === "vortex";
  const activePreset = PRESET_BY_ID[preset];
  const activePalette = PALETTES[activePaletteKey] || PALETTES.obsidian;

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  // Animation loop
  const animRef = useRef(null);
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();
    const frame = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setTimeOffset((prev) => (prev + dt * animSpeed * 1.5) % TAU);
      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, animSpeed]);

  const audioTimeoutRef = useRef(null);

  // Audio Playback
  const toggleAudify = () => {
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }

    if (isAudifying) {
      synthInstance.stop();
      setIsAudifying(false);
      return;
    }

    synthInstance.play(settings);
    setIsAudifying(true);
    audioTimeoutRef.current = setTimeout(() => {
      synthInstance.stop();
      setIsAudifying(false);
      audioTimeoutRef.current = null;
    }, settings.mode === "decay" ? 2800 : 3800);
  };

  const applyPreset = (key) => {
    const selected = PRESET_BY_ID[key];
    if (!selected) return;
    setPreset(key);
    setPresetCategory(selected.category);
    setSettings({ ...selected.settings });
  };

  const changeMode = (mode) => {
    setSettings((prev) => {
      if (mode === "vortex") {
        return {
          ...PRESETS.vortex,
          mode: "vortex",
        };
      }
      return {
        ...PRESETS[mode],
        mode,
        lineCount: prev.lineCount || PRESETS[mode].lineCount,
        thickness: prev.thickness || PRESETS[mode].thickness,
      };
    });
  };

  const randomizeCurrentMode = () => {
    setSettings((prev) => mutateSettings(prev, 0.45));
  };

  const surpriseMe = () => {
    const picked = randomChoice(PRESET_LIBRARY);
    setPresetCategory(picked.category);
    setPreset(picked.id);
    setSettings(mutateSettings({ ...picked.settings }, 0.28));
  };

  const mutateCurrent = () => {
    setSettings((prev) => mutateSettings(prev, variationAmount));
  };

  // URL Hash Permalinks
  const shareUrl = () => {
    const payload = { s: settings, p: activePaletteKey, a: aspectRatio, f: posterFrame };
    const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
    window.location.hash = `share=${encoded}`;
    navigator.clipboard.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  useEffect(() => {
    if (window.location.hash.startsWith("#share=")) {
      try {
        const raw = decodeURIComponent(window.location.hash.replace("#share=", ""));
        const parsed = JSON.parse(atob(raw));
        if (parsed.s) setSettings(parsed.s);
        if (parsed.p && PALETTES[parsed.p]) setActivePaletteKey(parsed.p);
        if (parsed.a) setAspectRatio(parsed.a);
        if (typeof parsed.f === "boolean") setPosterFrame(parsed.f);
      } catch (err) {
        console.warn("Could not parse shared harmonic state", err);
      }
    }
  }, []);

  const saveCustomPreset = () => {
    const name = window.prompt("Preset name:", `Study ${new Date().toLocaleTimeString()}`);
    if (!name) return;
    const item = { id: `custom-${Date.now()}`, name, settings: { ...settings } };
    const next = [item, ...customPresets].slice(0, 24);
    setCustomPresets(next);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(next));
  };

  const loadCustomPreset = (id) => {
    const found = customPresets.find((item) => item.id === id);
    if (!found) return;
    setSettings({ ...found.settings });
  };

  const copyPresetJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Export handlers
  const downloadSvg = (isPlotterOnly = false) => {
    const svg = document.getElementById("harmonic-poster-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (isPlotterOnly) {
      // AxiDraw/pen-plotter optimization: replace backgrounds and fills with pure path lines
      source = source.replace(/fill="[^"]*"/g, 'fill="none"');
    }

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harmonic-${settings.mode}-${isPlotterOnly ? "plotter" : "render"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const svg = document.getElementById("harmonic-poster-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scaleFactor = 2; // High-res retina export
      const vb = svg.viewBox.baseVal;
      canvas.width = vb.width * scaleFactor;
      canvas.height = vb.height * scaleFactor;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = activePalette.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `harmonic-${settings.mode}-poster.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const titles = {
    decay: ["Decay Cascade", "Damped Exponential Oscillation"],
    standing: ["Standing Wave", "Symmetrical Nodal Resonance"],
    interference: ["Interference Field", "Wave Superposition Studies"],
    resonance: ["Resonance Cavity", "Amplified Localized Harmonic"],
    fm: ["Frequency Modulation", "Acoustic Timbre & Phase Compression"],
    harmonograph: ["Harmonograph Knot", "Compound Damped Pendulum Orbit"],
    chladni: ["Chladni Modal Plate", "2D Acoustic Nodal Line Surface"],
    orbital: ["Orbital Ribbon", "Looped Topological Curve"],
    vortex: ["Logarithmic Vortex", "Radial Center-Tension Field"],
  };

  const [currentTitle, currentSubtitle] = titles[settings.mode] || ["Harmonic Study", "Mathematical Form"];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800">
      {/* Navigation Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="size-3.5 rounded-full bg-zinc-100 ring-4 ring-zinc-700/30" />
          <span className="text-sm font-semibold tracking-wider uppercase text-zinc-100">
            Harmonic Form Studio
          </span>
          <span className="hidden rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-widest text-zinc-400 sm:inline-block">
            Archival v2.5
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audify Synth Button */}
          <Button
            size="sm"
            variant={isAudifying ? "default" : "outline"}
            className="rounded-xl border-zinc-800 text-xs"
            onClick={toggleAudify}
            title="Listen to this equation via Web Audio synthesis"
          >
            {isAudifying ? <VolumeX className="size-3.5 mr-1 text-red-400" /> : <Volume2 className="size-3.5 mr-1" />}
            {isAudifying ? "Mute" : "Audify"}
          </Button>

          {/* Kinetic Animation Toggle */}
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            className="rounded-xl border-zinc-800 text-xs"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="size-3.5 mr-1 text-amber-400" /> : <Play className="size-3.5 mr-1" />}
            {isPlaying ? "Pause" : "Animate"}
          </Button>

          {/* Share URL */}
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-zinc-800 text-xs"
            onClick={shareUrl}
          >
            <Share2 className="size-3.5 mr-1" />
            {copyFeedback ? "Link Copied!" : "Share"}
          </Button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Controls Sidebar */}
          <div className="space-y-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
            <Card className="border-zinc-800/90 bg-zinc-900/60 shadow-xl backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Geometry & Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Form Mode Selector */}
                <div className="space-y-1.5">
                  <Label>Mathematical Form Mode</Label>
                  <Select value={settings.mode} onValueChange={changeMode}>
                    <SelectTrigger className="w-full border-zinc-800 bg-zinc-950">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="decay">Decay (Damped Oscillation)</SelectItem>
                      <SelectItem value="standing">Standing Wave (Nodal)</SelectItem>
                      <SelectItem value="interference">Wave Interference</SelectItem>
                      <SelectItem value="resonance">Resonance Cavity</SelectItem>
                      <SelectItem value="fm">FM Synthesis Timbre</SelectItem>
                      <SelectItem value="harmonograph">Harmonograph Pendulum</SelectItem>
                      <SelectItem value="chladni">Chladni Modal Plate</SelectItem>
                      <SelectItem value="orbital">Orbital Ribbon</SelectItem>
                      <SelectItem value="vortex">Logarithmic Vortex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preset Browser */}
                <Section title="Preset Library" description="Curated parametric studies ready for archival framing.">
                  <div className="space-y-2">
                    <Label>Study Category</Label>
                    <Select value={presetCategory} onValueChange={setPresetCategory}>
                      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preset Selection</Label>
                    <Select value={preset} onValueChange={applyPreset}>
                      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_LIBRARY.filter((p) => p.category === presetCategory).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button variant="secondary" size="sm" className="rounded-xl text-xs" onClick={randomizeCurrentMode}>
                      <Sparkles className="size-3.5 mr-1 text-zinc-400" /> Randomize
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-xl text-xs" onClick={surpriseMe}>
                      Surprise Me
                    </Button>
                  </div>
                </Section>

                {/* Color Palette & Archival Framing */}
                <Section title="Archival Presentation" description="Color harmony and Swiss typographic framing.">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <PaletteIcon className="size-3.5 text-zinc-400" /> Print Palette
                    </Label>
                    <Select value={activePaletteKey} onValueChange={setActivePaletteKey}>
                      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PALETTES).map((pal) => (
                          <SelectItem key={pal.id} value={pal.id}>
                            <div className="flex items-center gap-2">
                              <span className="size-3 rounded-full border border-zinc-700" style={{ backgroundColor: pal.bg }} />
                              {pal.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label>Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="w-full border-zinc-800 bg-zinc-950">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landscape">16:9 Landscape</SelectItem>
                          <SelectItem value="portrait">3:4 Portrait</SelectItem>
                          <SelectItem value="square">1:1 Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col justify-end space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="posterFrame" className="text-xs">Poster Frame</Label>
                        <Switch id="posterFrame" checked={posterFrame} onCheckedChange={setPosterFrame} />
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Topographic Occlusion 3D Ridge Section */}
                {!isVortexMode && settings.mode !== "orbital" && settings.mode !== "harmonograph" && (
                  <Section
                    title="Topographic Occlusion (3D Ridge)"
                    description="Hidden surface removal where front waves occlude background waves like mountain ridges."
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor="occlusion" className="text-zinc-200">Enable 3D Ridge Masking</Label>
                      <Switch
                        id="occlusion"
                        checked={Boolean(settings.occlusion)}
                        onCheckedChange={(val) => update("occlusion", val)}
                      />
                    </div>
                    {settings.occlusion && (
                      <Control
                        label="Ridge Stacking Depth"
                        value={settings.occlusionDepth}
                        min={0.1}
                        max={1.5}
                        step={0.02}
                        onChange={(v) => update("occlusionDepth", v)}
                      />
                    )}
                  </Section>
                )}

                {/* Structure Controls */}
                {!isVortexMode ? (
                  <Section title="Wave Physics & Structure" description="Core harmonic parameters shaping motion logic.">
                    <Control label="Primary Frequency" value={settings.frequency} min={0.5} max={12} step={0.1} onChange={(v) => update("frequency", v)} />
                    <Control label="Oscillation Amplitude" value={settings.amplitude} min={0.1} max={1.2} step={0.01} onChange={(v) => update("amplitude", v)} />
                    <Control label="Symmetry Tension" value={settings.symmetry} min={0} max={1} step={0.01} onChange={(v) => update("symmetry", v)} />
                    <Control label="Focal Compression" value={settings.focalCompression} min={0} max={1} step={0.01} onChange={(v) => update("focalCompression", v)} />

                    {settings.mode === "decay" && (
                      <Control label="Exponential Damping" value={settings.damping} min={0.2} max={5.0} step={0.05} onChange={(v) => update("damping", v)} />
                    )}

                    {showAdvanced && (
                      <>
                        <Control label="Secondary Harmonic Mix" value={settings.secondaryMix} min={0} max={1} step={0.01} onChange={(v) => update("secondaryMix", v)} />
                        <Control label="Secondary Frequency" value={settings.secondaryFrequency} min={0.5} max={18} step={0.1} onChange={(v) => update("secondaryFrequency", v)} />
                        <Control label="Secondary Phase" value={settings.secondaryPhase} min={0} max={TAU} step={0.02} onChange={(v) => update("secondaryPhase", v)} />
                      </>
                    )}
                  </Section>
                ) : (
                  <Section title="Spiral Structure" description="Radial log-growth, turns, and center pull.">
                    <Control label="Spiral Turns" value={settings.spiralTurns} min={1.5} max={14} step={0.1} onChange={(v) => update("spiralTurns", v)} />
                    <Control label="Logarithmic Growth" value={settings.spiralGrowth} min={-0.6} max={3.5} step={0.01} onChange={(v) => update("spiralGrowth", v)} />
                    <Control label="Center Tension Pull" value={settings.centerPull} min={0} max={1} step={0.01} onChange={(v) => update("centerPull", v)} />
                    <Control label="Inner Void Core" value={settings.innerVoid} min={0} max={0.45} step={0.01} onChange={(v) => update("innerVoid", v)} />
                    {showAdvanced && (
                      <Control label="Ellipse Flattening" value={settings.ellipse} min={0} max={0.8} step={0.01} onChange={(v) => update("ellipse", v)} />
                    )}
                  </Section>
                )}

                {/* Line Quality & Rendering */}
                <Section title="Line Density & Trace" description="Trace count, phase spread, and organic jitter.">
                  <Control
                    label={isVortexMode ? "Radial Line Count" : "Line Count"}
                    value={isVortexMode ? settings.radialLineCount : settings.lineCount}
                    min={8}
                    max={60}
                    step={1}
                    onChange={(v) => update(isVortexMode ? "radialLineCount" : "lineCount", Math.round(v))}
                  />
                  <Control
                    label={isVortexMode ? "Radial Spread" : "Line Spread"}
                    value={isVortexMode ? settings.radialSpread : settings.spread}
                    min={0.02}
                    max={0.4}
                    step={0.01}
                    onChange={(v) => update(isVortexMode ? "radialSpread" : "spread", v)}
                  />
                  {!isVortexMode && (
                    <Control label="Phase Dispersion" value={settings.phaseSpread} min={0} max={3.0} step={0.02} onChange={(v) => update("phaseSpread", v)} />
                  )}
                  <Control label="Stroke Weight (Thickness)" value={settings.thickness} min={0.4} max={2.2} step={0.02} onChange={(v) => update("thickness", v)} />
                  <Control label="Trace Opacity" value={settings.opacity} min={0.1} max={1.0} step={0.01} onChange={(v) => update("opacity", v)} />
                </Section>

                {/* Advanced Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <Label htmlFor="advanced-toggle" className="text-xs text-zinc-300">Show Advanced Physics Tuning</Label>
                  <Switch id="advanced-toggle" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                </div>

                {/* Export Section */}
                <Section title="Archival Export" description="Production-ready formats for raster and pen plotters.">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" className="rounded-xl text-xs" onClick={() => downloadSvg(false)}>
                      <Download className="size-3.5 mr-1.5" /> SVG Render
                    </Button>
                    <Button variant="secondary" className="rounded-xl text-xs" onClick={() => downloadSvg(true)}>
                      <Download className="size-3.5 mr-1.5" /> Plotter SVG
                    </Button>
                    <Button className="col-span-2 rounded-xl text-xs" onClick={downloadPng}>
                      <Download className="size-3.5 mr-1.5" /> Export High-Res PNG (Retina 2x)
                    </Button>
                  </div>
                </Section>
              </CardContent>
            </Card>
          </div>

          {/* Visual Artwork Preview Panel */}
          <div className="space-y-5">
            <div className="sticky top-20 space-y-4">
              {/* Art Canvas Container */}
              <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-zinc-900/30 p-3 lg:p-5 shadow-2xl backdrop-blur">
                <HarmonicSvg
                  settings={settings}
                  palette={activePalette}
                  aspectRatio={aspectRatio}
                  posterFrame={posterFrame}
                  timeOffset={timeOffset}
                />
              </div>

              {/* Plate Information Card */}
              <div className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                    Live Harmonic Study // {settings.mode}
                  </div>
                  <div className="text-xl font-medium text-zinc-100">{currentTitle}</div>
                  <div className="text-xs text-zinc-400">{currentSubtitle}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-zinc-800 text-xs"
                    onClick={saveCustomPreset}
                  >
                    Save Preset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-zinc-800 text-xs"
                    onClick={copyPresetJson}
                  >
                    <Copy className="size-3.5 mr-1" />
                    {copyFeedback ? "Copied" : "JSON"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-zinc-800 text-xs"
                    onClick={() => applyPreset(preset)}
                  >
                    <RefreshCw className="size-3.5 mr-1" /> Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}