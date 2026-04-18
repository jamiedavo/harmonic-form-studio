import React, { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const TAU = Math.PI * 2;

const PRESETS = {
  decay: {
    mode: "decay",
    frequency: 6.5,
    amplitude: 0.82,
    lineCount: 32,
    spread: 0.18,
    phaseSpread: 1.1,
    damping: 2.9,
    secondaryMix: 0.24,
    secondaryFrequency: 10,
    secondaryPhase: 1.4,
    axisLine: false,
    endpoints: true,
    thickness: 1.15,
    opacity: 0.8,
    scale: 0.9,
    yOffset: 0,
    xPadding: 0.06,
  },
  standing: {
    mode: "standing",
    frequency: 2,
    amplitude: 0.62,
    lineCount: 28,
    spread: 0.12,
    phaseSpread: 0.6,
    damping: 0,
    secondaryMix: 0.12,
    secondaryFrequency: 4,
    secondaryPhase: 1.57,
    axisLine: false,
    endpoints: true,
    thickness: 1,
    opacity: 0.75,
    scale: 0.88,
    yOffset: 0,
    xPadding: 0.08,
  },
  interference: {
    mode: "interference",
    frequency: 3.4,
    amplitude: 0.55,
    lineCount: 26,
    spread: 0.22,
    phaseSpread: 1.6,
    damping: 0,
    secondaryMix: 0.72,
    secondaryFrequency: 5.1,
    secondaryPhase: 1.18,
    axisLine: false,
    endpoints: true,
    thickness: 1,
    opacity: 0.74,
    scale: 0.88,
    yOffset: 0,
    xPadding: 0.07,
  },
  resonance: {
    mode: "resonance",
    frequency: 5.8,
    amplitude: 0.78,
    lineCount: 34,
    spread: 0.16,
    phaseSpread: 1.2,
    damping: 0,
    secondaryMix: 0.4,
    secondaryFrequency: 8.2,
    secondaryPhase: 0.7,
    axisLine: true,
    endpoints: false,
    thickness: 1.1,
    opacity: 0.78,
    scale: 0.9,
    yOffset: 0,
    xPadding: 0.03,
  },
  orbital: {
    mode: "orbital",
    frequency: 2.5,
    amplitude: 0.62,
    lineCount: 30,
    spread: 0.18,
    phaseSpread: 1.2,
    damping: 0,
    secondaryMix: 0.45,
    secondaryFrequency: 4,
    secondaryPhase: 1.57,
    axisLine: true,
    endpoints: false,
    thickness: 1,
    opacity: 0.72,
    scale: 0.78,
    yOffset: 0,
    xPadding: 0.14,
  },
  vortex: {
    mode: "vortex",
    frequency: 8,
    amplitude: 0.82,
    lineCount: 36,
    spread: 0.14,
    phaseSpread: 1,
    damping: 0,
    secondaryMix: 0.25,
    secondaryFrequency: 13,
    secondaryPhase: 0.8,
    axisLine: false,
    endpoints: false,
    thickness: 0.95,
    opacity: 0.7,
    scale: 0.82,
    yOffset: 0,
    xPadding: 0.12,
  },
};

function gaussian(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z);
}

function buildWavePath(settings, lineIndex, width, height) {
  const {
    mode,
    frequency,
    amplitude,
    lineCount,
    spread,
    phaseSpread,
    damping,
    secondaryMix,
    secondaryFrequency,
    secondaryPhase,
    scale,
    yOffset,
    xPadding,
  } = settings;

  const padX = width * xPadding;
  const usableWidth = width - padX * 2;
  const centerY = height / 2 + yOffset * height * 0.25;
  const ampPx = amplitude * height * 0.3 * scale;
  const n = 600;
  const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread;
  const ampOffset = 1 + norm * spread;

  let d = "";

  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const x = padX + t * usableWidth;
    const u = t * TAU;

    let yNorm = 0;

    if (mode === "decay") {
      const env = Math.exp(-damping * t);
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.6);
      yNorm = (w1 + w2) * env * ampOffset;
    } else if (mode === "standing") {
      const envelope = Math.sin(Math.PI * t);
      const carrier = Math.sin(frequency * Math.PI * t + phaseOffset);
      const shimmer = secondaryMix * 0.3 * Math.sin(secondaryFrequency * Math.PI * t + secondaryPhase + phaseOffset);
      yNorm = envelope * (carrier + shimmer) * ampOffset;
    } else if (mode === "interference") {
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase - phaseOffset * 0.8);
      yNorm = (w1 + w2) * 0.5 * ampOffset;
    } else if (mode === "resonance") {
      const env =
        0.18 +
        0.45 * gaussian(t, 0.25, 0.09) +
        1.1 * gaussian(t, 0.55, 0.08) +
        0.75 * gaussian(t, 0.73, 0.06);
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.4);
      yNorm = (w1 + w2) * env * ampOffset;
    } else if (mode === "orbital") {
      const orbit = Math.sin(u * frequency * 0.5 + phaseOffset);
      const fold = Math.sin(u * secondaryFrequency * 0.25 + secondaryPhase);
      const ribbon = Math.sin(u * frequency + phaseOffset) * 0.45;
      yNorm = (orbit * fold + ribbon * secondaryMix) * ampOffset;
    } else if (mode === "vortex") {
      const radialEnv = Math.sin(Math.PI * t) ** 0.9;
      const spiral = Math.sin(frequency * u + phaseOffset + t * TAU * 0.75);
      const turbulence = secondaryMix * 0.4 * Math.sin(secondaryFrequency * u - phaseOffset * 0.5);
      yNorm = radialEnv * (spiral + turbulence) * ampOffset;
    }

    const y = centerY - yNorm * ampPx;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return d;
}

function buildOrbitalPath(settings, lineIndex, width, height) {
  const {
    frequency,
    amplitude,
    lineCount,
    spread,
    phaseSpread,
    secondaryMix,
    secondaryFrequency,
    secondaryPhase,
    scale,
    yOffset,
  } = settings;

  const cx = width / 2;
  const cy = height / 2 + yOffset * height * 0.25;
  const rx = width * 0.24 * scale;
  const ry = height * 0.21 * scale;
  const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread;
  const sizeOffset = 1 + norm * spread * 0.6;

  let d = "";
  const steps = 900;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * TAU;
    const x =
      cx +
      rx * sizeOffset * Math.sin(t) +
      rx * 0.35 * secondaryMix * Math.sin(secondaryFrequency * t + secondaryPhase + phaseOffset);
    const y =
      cy +
      ry * sizeOffset * Math.sin(frequency * t + phaseOffset) * amplitude +
      ry * 0.28 * Math.cos(t * 2 + phaseOffset * 0.4);
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildVortexPath(settings, lineIndex, width, height) {
  const {
    frequency,
    amplitude,
    lineCount,
    spread,
    phaseSpread,
    secondaryMix,
    secondaryFrequency,
    secondaryPhase,
    scale,
    yOffset,
  } = settings;

  const cx = width / 2;
  const cy = height / 2 + yOffset * height * 0.25;
  const maxR = Math.min(width, height) * 0.29 * scale;
  const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread;
  const radiusBias = 1 + norm * spread * 0.8;

  let d = "";
  const steps = 1100;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * TAU * (2.5 + frequency * 0.22) + phaseOffset;
    const radius = maxR * t * radiusBias * (0.9 + 0.14 * Math.sin(secondaryFrequency * angle + secondaryPhase) * secondaryMix);
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle) * amplitude;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function HarmonicSvg({ settings, title, subtitle }) {
  const width = 1400;
  const height = 840;

  const paths = useMemo(() => {
    const list = [];
    for (let i = 0; i < settings.lineCount; i += 1) {
      let d;
      if (settings.mode === "orbital") {
        d = buildOrbitalPath(settings, i, width, height);
      } else if (settings.mode === "vortex") {
        d = buildVortexPath(settings, i, width, height);
      } else {
        d = buildWavePath(settings, i, width, height);
      }
      list.push(d);
    }
    return list;
  }, [settings]);

  const strokeOpacity = clamp(settings.opacity, 0.05, 1);

  return (
    <svg
      id="harmonic-poster-svg"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto rounded-3xl bg-black"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Harmonic poster preview"
    >
      <rect x="0" y="0" width={width} height={height} fill="#000000" />

      {settings.axisLine && settings.mode !== "vortex" && (
        <line
          x1="120"
          y1={height / 2}
          x2={width - 120}
          y2={height / 2}
          stroke="rgba(255,255,255,0.78)"
          strokeWidth="1.1"
        />
      )}

      <g fill="none" stroke="#F5F3EE" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            strokeWidth={settings.thickness}
            strokeOpacity={strokeOpacity * (0.45 + (i / Math.max(1, paths.length - 1)) * 0.55)}
          />
        ))}
      </g>
    </svg>
  );
}

function Control({ label, value, min, max, step = 0.01, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-zinc-300">
        <Label>{label}</Label>
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

  const applyPreset = (key) => {
    setPreset(key);
    setSettings(PRESETS[key]);
  };

  const titles = {
    decay: ["Decay", "Damped Oscillation"],
    standing: ["Standing Wave", "Symmetrical Harmonic Form"],
    interference: ["Interference", "Wave Superposition"],
    resonance: ["Resonance", "Amplified Oscillation Field"],
    orbital: ["Orbital Ribbon", "Looped Harmonic Motion"],
    vortex: ["Vortex Spiral", "Rotational Field Study"],
  };

  const [title, subtitle] = titles[settings.mode];

  const downloadSvg = () => {
    const svg = document.getElementById("harmonic-poster-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid max-w-7xl gap-6 p-4 md:p-6 lg:grid-cols-[360px_1fr]">
        <Card className="order-2 border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/30 backdrop-blur lg:order-1">
          <CardHeader>
            <CardTitle className="text-xl">Harmonic Form Studio</CardTitle>
            <p className="text-sm text-zinc-400">
              Build poster-ready oscillation forms with curated presets and fine control over motion, trace density, and composition.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Preset</Label>
              <Select value={preset} onValueChange={applyPreset}>
                <SelectTrigger className="border-zinc-800 bg-zinc-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decay">Decay</SelectItem>
                  <SelectItem value="standing">Standing Wave</SelectItem>
                  <SelectItem value="interference">Interference</SelectItem>
                  <SelectItem value="resonance">Resonance</SelectItem>
                  <SelectItem value="orbital">Orbital Ribbon</SelectItem>
                  <SelectItem value="vortex">Vortex Spiral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              <Control label="Frequency" value={settings.frequency} min={0.5} max={14} step={0.1} onChange={(v) => update("frequency", v)} />
              <Control label="Amplitude" value={settings.amplitude} min={0.1} max={1.2} step={0.01} onChange={(v) => update("amplitude", v)} />
              <Control label="Line Count" value={settings.lineCount} min={6} max={60} step={1} onChange={(v) => update("lineCount", Math.round(v))} />
              <Control label="Line Spread" value={settings.spread} min={0} max={0.5} step={0.01} onChange={(v) => update("spread", v)} />
              <Control label="Phase Spread" value={settings.phaseSpread} min={0} max={3} step={0.01} onChange={(v) => update("phaseSpread", v)} />
              <Control label="Secondary Mix" value={settings.secondaryMix} min={0} max={1} step={0.01} onChange={(v) => update("secondaryMix", v)} />
              <Control label="Secondary Frequency" value={settings.secondaryFrequency} min={0.5} max={18} step={0.1} onChange={(v) => update("secondaryFrequency", v)} />
              <Control label="Secondary Phase" value={settings.secondaryPhase} min={0} max={6.28} step={0.01} onChange={(v) => update("secondaryPhase", v)} />
              {settings.mode === "decay" && (
                <Control label="Damping" value={settings.damping} min={0.2} max={5} step={0.01} onChange={(v) => update("damping", v)} />
              )}
              <Control label="Stroke Weight" value={settings.thickness} min={0.4} max={2.2} step={0.01} onChange={(v) => update("thickness", v)} />
              <Control label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.01} onChange={(v) => update("opacity", v)} />
              <Control label="Scale" value={settings.scale} min={0.45} max={1.1} step={0.01} onChange={(v) => update("scale", v)} />
              <Control label="Vertical Offset" value={settings.yOffset} min={-1} max={1} step={0.01} onChange={(v) => update("yOffset", v)} />
              <Control label="Horizontal Padding" value={settings.xPadding} min={0.01} max={0.2} step={0.005} onChange={(v) => update("xPadding", v)} />
            </div>

            <div className="grid gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="axis" className="text-zinc-200">Axis Line</Label>
                <Switch id="axis" checked={settings.axisLine} onCheckedChange={(v) => update("axisLine", v)} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 rounded-2xl" onClick={() => applyPreset(preset)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Preset
              </Button>
              <Button variant="secondary" className="flex-1 rounded-2xl" onClick={downloadSvg}>
                <Download className="mr-2 h-4 w-4" /> Export SVG
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="order-1 space-y-4 lg:order-2">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/30 p-2 md:p-4 shadow-2xl shadow-black/30">
            <HarmonicSvg settings={settings} title={title} subtitle={subtitle} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4 text-sm text-zinc-400">
                <div className="mb-2 text-zinc-200">What this is</div>
                A curated harmonic poster generator, not a literal audio tool. The goal is elegant printable motion studies.
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4 text-sm text-zinc-400">
                <div className="mb-2 text-zinc-200">Strongest presets</div>
                Decay, Interference, and Resonance are the clearest commercial starting points for premium print outputs.
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4 text-sm text-zinc-400">
                <div className="mb-2 text-zinc-200">Export path</div>
                This exports SVG linework now. Later you can add PNG export, poster typography templates, and saved collections.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

