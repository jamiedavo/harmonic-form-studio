import React, { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

// --- MATH & PRESETS (Your Original Logic) ---
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const TAU = Math.PI * 2;
const PRESETS = {
  decay: { mode: "decay", frequency: 6.5, amplitude: 0.82, lineCount: 32, spread: 0.18, phaseSpread: 1.1, damping: 2.9, secondaryMix: 0.24, secondaryFrequency: 10, secondaryPhase: 1.4, axisLine: false, thickness: 1.15, opacity: 0.8, scale: 0.9, yOffset: 0, xPadding: 0.06 },
  standing: { mode: "standing", frequency: 2, amplitude: 0.62, lineCount: 28, spread: 0.12, phaseSpread: 0.6, damping: 0, secondaryMix: 0.12, secondaryFrequency: 4, secondaryPhase: 1.57, axisLine: false, thickness: 1, opacity: 0.75, scale: 0.88, yOffset: 0, xPadding: 0.08 },
  interference: { mode: "interference", frequency: 3.4, amplitude: 0.55, lineCount: 26, spread: 0.22, phaseSpread: 1.6, damping: 0, secondaryMix: 0.72, secondaryFrequency: 5.1, secondaryPhase: 1.18, axisLine: false, thickness: 1, opacity: 0.74, scale: 0.88, yOffset: 0, xPadding: 0.07 },
  resonance: { mode: "resonance", frequency: 5.8, amplitude: 0.78, lineCount: 34, spread: 0.16, phaseSpread: 1.2, damping: 0, secondaryMix: 0.4, secondaryFrequency: 8.2, secondaryPhase: 0.7, axisLine: true, thickness: 1.1, opacity: 0.78, scale: 0.9, yOffset: 0, xPadding: 0.03 },
  orbital: { mode: "orbital", frequency: 2.5, amplitude: 0.62, lineCount: 30, spread: 0.18, phaseSpread: 1.2, damping: 0, secondaryMix: 0.45, secondaryFrequency: 4, secondaryPhase: 1.57, axisLine: true, thickness: 1, opacity: 0.72, scale: 0.78, yOffset: 0, xPadding: 0.14 },
  vortex: { mode: "vortex", frequency: 8, amplitude: 0.82, lineCount: 36, spread: 0.14, phaseSpread: 1, damping: 0, secondaryMix: 0.25, secondaryFrequency: 13, secondaryPhase: 0.8, axisLine: false, thickness: 0.95, opacity: 0.7, scale: 0.82, yOffset: 0, xPadding: 0.12 },
};

function gaussian(x, mu, sigma) { const z = (x - mu) / sigma; return Math.exp(-0.5 * z * z); }

// --- PATH GENERATORS (Your Original Logic) ---
function buildWavePath(settings, lineIndex, width, height) {
  const { mode, frequency, amplitude, lineCount, spread, phaseSpread, damping, secondaryMix, secondaryFrequency, secondaryPhase, scale, yOffset, xPadding } = settings;
  const padX = width * xPadding; const usableWidth = width - padX * 2;
  const centerY = height / 2 + yOffset * height * 0.25;
  const ampPx = amplitude * height * 0.3 * scale;
  const n = 600; const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread; const ampOffset = 1 + norm * spread;
  let d = "";
  for (let i = 0; i <= n; i += 1) {
    const t = i / n; const x = padX + t * usableWidth; const u = t * TAU;
    let yNorm = 0;
    if (mode === "decay") yNorm = (Math.sin(frequency * u + phaseOffset) + secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.6)) * Math.exp(-damping * t) * ampOffset;
    else if (mode === "standing") yNorm = Math.sin(Math.PI * t) * (Math.sin(frequency * Math.PI * t + phaseOffset) + secondaryMix * 0.3 * Math.sin(secondaryFrequency * Math.PI * t + secondaryPhase + phaseOffset)) * ampOffset;
    else if (mode === "interference") yNorm = (Math.sin(frequency * u + phaseOffset) + secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase - phaseOffset * 0.8)) * 0.5 * ampOffset;
    else if (mode === "resonance") {
      const env = 0.18 + 0.45 * gaussian(t, 0.25, 0.09) + 1.1 * gaussian(t, 0.55, 0.08) + 0.75 * gaussian(t, 0.73, 0.06);
      yNorm = (Math.sin(frequency * u + phaseOffset) + secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.4)) * env * ampOffset;
    }
    const y = centerY - yNorm * ampPx;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildOrbitalPath(settings, lineIndex, width, height) {
  const { frequency, amplitude, lineCount, spread, phaseSpread, secondaryMix, secondaryFrequency, secondaryPhase, scale, yOffset } = settings;
  const cx = width / 2; const cy = height / 2 + yOffset * height * 0.25;
  const rx = width * 0.24 * scale; const ry = height * 0.21 * scale;
  const mid = (lineCount - 1) / 2; const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread; const sizeOffset = 1 + norm * spread * 0.6;
  let d = ""; const steps = 800;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * TAU;
    const x = cx + rx * sizeOffset * Math.sin(t) + rx * 0.35 * secondaryMix * Math.sin(secondaryFrequency * t + secondaryPhase + phaseOffset);
    const y = cy + ry * sizeOffset * Math.sin(frequency * t + phaseOffset) * amplitude + ry * 0.28 * Math.cos(t * 2 + phaseOffset * 0.4);
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildVortexPath(settings, lineIndex, width, height) {
  const { frequency, amplitude, lineCount, spread, phaseSpread, secondaryMix, secondaryFrequency, secondaryPhase, scale, yOffset } = settings;
  const cx = width / 2; const cy = height / 2 + yOffset * height * 0.25;
  const maxR = Math.min(width, height) * 0.29 * scale;
  const mid = (lineCount - 1) / 2; const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread; const radiusBias = 1 + norm * spread * 0.8;
  let d = ""; const steps = 1000;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps; const angle = t * TAU * (2.5 + frequency * 0.22) + phaseOffset;
    const radius = maxR * t * radiusBias * (0.9 + 0.14 * Math.sin(secondaryFrequency * angle + secondaryPhase) * secondaryMix);
    const x = cx + radius * Math.cos(angle); const y = cy + radius * Math.sin(angle) * amplitude;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

// --- MAIN COMPONENTS ---
function HarmonicSvg({ settings }) {
  const width = 1400; const height = 840;
  const paths = useMemo(() => {
    const list = [];
    for (let i = 0; i < settings.lineCount; i += 1) {
      if (settings.mode === "orbital") list.push(buildOrbitalPath(settings, i, width, height));
      else if (settings.mode === "vortex") list.push(buildVortexPath(settings, i, width, height));
      else list.push(buildWavePath(settings, i, width, height));
    }
    return list;
  }, [settings]);

  return (
    <svg id="harmonic-poster-svg" viewBox={`0 0 ${width} ${height}`} className="w-full h-full bg-black rounded-lg" xmlns="http://www.w3.org/2000/svg">
      <rect width={width} height={height} fill="#000" />
      <g fill="none" stroke="#F5F3EE" strokeWidth={settings.thickness} strokeLinecap="round">
        {paths.map((d, i) => (
          <path key={i} d={d} strokeOpacity={settings.opacity * (0.45 + (i / Math.max(1, paths.length - 1)) * 0.55)} />
        ))}
      </g>
    </svg>
  );
}

function Control({ label, value, min, max, step = 0.01, onChange }) {
  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-zinc-400 tracking-tighter">
        <Label className="text-zinc-100">{label}</Label>
        <span className="tabular-nums text-zinc-500">{value.toFixed(2)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

export default function App() {
  const [preset, setPreset] = useState("interference");
  const [settings, setSettings] = useState(PRESETS.interference);
  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">
      {/* FIXED TOP PREVIEW */}
      <div className="sticky top-0 z-20 bg-black p-4 border-b border-zinc-900 shadow-2xl">
        <div className="mx-auto w-full max-w-4xl aspect-[14/8.4] min-h-[220px]">
          <HarmonicSvg settings={settings} />
        </div>
      </div>

      {/* SCROLLABLE CONTROLS */}
      <div className="flex-1 w-full max-w-lg mx-auto p-6 space-y-10 pb-32">
        
        {/* PRESET SECTION */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Selected Preset</Label>
          <Select value={preset} onValueChange={(v) => { setPreset(v); setSettings(PRESETS[v]); }}>
            <SelectTrigger className="w-full h-12 bg-zinc-900 border-zinc-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              {Object.keys(PRESETS).map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* CONTROLS GROUPS */}
        <div className="space-y-8 border-t border-zinc-900 pt-8">
          <Control label="Frequency" value={settings.frequency} min={0.5} max={14} step={0.1} onChange={(v) => update("frequency", v)} />
          <Control label="Amplitude" value={settings.amplitude} min={0.1} max={1.2} step={0.01} onChange={(v) => update("amplitude", v)} />
          <Control label="Lines" value={settings.lineCount} min={6} max={60} step={1} onChange={(v) => update("lineCount", v)} />
          <Control label="Phase Spread" value={settings.phaseSpread} min={0} max={3} step={0.01} onChange={(v) => update("phaseSpread", v)} />
          <Control label="Spread" value={settings.spread} min={0} max={0.5} step={0.01} onChange={(v) => update("spread", v)} />
        </div>

        <div className="space-y-8 border-t border-zinc-900 pt-8">
          <Control label="Sec. Mix" value={settings.secondaryMix} min={0} max={1} step={0.01} onChange={(v) => update("secondaryMix", v)} />
          <Control label="Sec. Freq" value={settings.secondaryFrequency} min={0.5} max={18} step={0.1} onChange={(v) => update("secondaryFrequency", v)} />
          <Control label="Sec. Phase" value={settings.secondaryPhase} min={0} max={6.28} step={0.01} onChange={(v) => update("secondaryPhase", v)} />
        </div>

        <div className="space-y-8 border-t border-zinc-900 pt-8 pb-10">
          <Control label="Stroke" value={settings.thickness} min={0.4} max={2.2} step={0.01} onChange={(v) => update("thickness", v)} />
          <Control label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.01} onChange={(v) => update("opacity", v)} />
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <Label className="text-zinc-200 text-sm">Axis Line</Label>
            <Switch checked={settings.axisLine} onCheckedChange={(v) => update("axisLine", v)} />
          </div>
        </div>

      </div>
    </div>
  );
}
  
