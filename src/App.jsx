import React, { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
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
    symmetry: 0.18,
    directionBias: -0.55,
    focalCompression: 0.16,
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
    symmetry: 0.94,
    directionBias: 0,
    focalCompression: 0.2,
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
    symmetry: 0.72,
    directionBias: 0.08,
    focalCompression: 0.42,
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
    symmetry: 0.84,
    directionBias: 0.12,
    focalCompression: 0.68,
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
    symmetry: 0.58,
    directionBias: 0.18,
    focalCompression: 0.46,
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
    endpoints: false,
    thickness: 0.84,
    opacity: 0.72,
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
    radialLineCount: 22,
    densityBias: "even",
    radialSpread: 0.12,
    rotation: 0.08,
    thickness: 0.92,
    opacity: 0.64,
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
    radialLineCount: 30,
    densityBias: "outer",
    radialSpread: 0.18,
    rotation: 0.14,
    thickness: 0.88,
    opacity: 0.7,
    scale: 0.84,
    yOffset: 0,
  },
};

const VORTEX_DEFAULTS = {
  ...PRESETS.vortex,
};

function gaussian(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z);
}

function buildWavePath(settings, lineIndex, width, height) {
  const {
    mode, frequency, amplitude, lineCount, spread, phaseSpread,
    damping, secondaryMix, secondaryFrequency, secondaryPhase,
    symmetry, directionBias, focalCompression,
    scale, yOffset, xPadding,
  } = settings;

  const padX = width * xPadding;
  const usableWidth = width - padX * 2;
  const centerY = height / 2 + yOffset * height * 0.25;
  const ampPx = amplitude * height * 0.3 * scale;
  const n = 600;
  const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const symmetryBias = lerp(norm, Math.sign(norm) * Math.abs(norm) ** (1.6 - symmetry * 0.8), symmetry);
  const phaseOffset = symmetryBias * phaseSpread;
  const ampOffset = 1 + norm * spread;
  const focusCenter = clamp(0.5 + directionBias * 0.22, 0.12, 0.88);
  const focusSigma = lerp(0.32, 0.12, focalCompression);

  let d = "";
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const x = padX + t * usableWidth;
    const u = t * TAU;
    const mirroredT = 1 - Math.abs(2 * t - 1);
    const structuralT = lerp(t, mirroredT, symmetry);
    const focusBoost = 1 + focalCompression * gaussian(t, focusCenter, focusSigma) * 1.25;
    let yNorm = 0;

    if (mode === "decay") {
      const biasedT = clamp(t + Math.max(0, directionBias) * 0.22, 0, 1);
      const env = Math.exp(-damping * biasedT);
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.6);
      yNorm = (w1 + w2) * env * ampOffset * lerp(1, focusBoost, 0.35);
    } else if (mode === "standing") {
      const envelope = lerp(Math.sin(Math.PI * t), Math.sin(Math.PI * structuralT), symmetry);
      const carrier = Math.sin(frequency * Math.PI * structuralT + phaseOffset);
      const shimmer = secondaryMix * 0.3 * Math.sin(secondaryFrequency * Math.PI * structuralT + secondaryPhase + phaseOffset);
      yNorm = envelope * (carrier + shimmer) * ampOffset * lerp(1, focusBoost, 0.45);
    } else if (mode === "interference") {
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase - phaseOffset * 0.8);
      yNorm = (w1 + w2) * 0.5 * ampOffset * focusBoost;
    } else if (mode === "resonance") {
      const env =
        0.18 +
        0.45 * gaussian(t, 0.25 + directionBias * 0.04, 0.09) +
        1.1 * gaussian(t, 0.55 + directionBias * 0.08, lerp(0.09, 0.05, focalCompression)) +
        0.75 * gaussian(t, 0.73 + directionBias * 0.05, 0.06);
      const w1 = Math.sin(frequency * u + phaseOffset);
      const w2 = secondaryMix * Math.sin(secondaryFrequency * u + secondaryPhase + phaseOffset * 0.4);
      yNorm = (w1 + w2) * env * ampOffset * lerp(1, focusBoost, 0.5);
    } else if (mode === "orbital") {
      const orbit = Math.sin(u * frequency * 0.5 + phaseOffset);
      const fold = Math.sin(u * secondaryFrequency * 0.25 + secondaryPhase);
      const ribbon = Math.sin(u * frequency + phaseOffset) * 0.45;
      yNorm = (orbit * fold + ribbon * secondaryMix) * ampOffset * lerp(1, focusBoost, 0.4);
    }

    const y = centerY - yNorm * ampPx;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildOrbitalPath(settings, lineIndex, width, height) {
  const {
    frequency, amplitude, lineCount, spread, phaseSpread,
    secondaryMix, secondaryFrequency, secondaryPhase,
    symmetry, directionBias, focalCompression,
    scale, yOffset,
  } = settings;

  const cx = width / 2 + directionBias * width * 0.08;
  const cy = height / 2 + yOffset * height * 0.25;
  const rx = width * 0.24 * scale;
  const ry = height * 0.21 * scale;
  const mid = (lineCount - 1) / 2;
  const norm = lineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const phaseOffset = norm * phaseSpread;
  const sizeOffset = 1 + norm * spread * 0.6;
  const tension = 1 + focalCompression * 0.35;

  let d = "";
  const steps = 900;
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * TAU;
    const symmetryFold = lerp(1, Math.cos(t * 2), symmetry * 0.25);
    const x =
      cx +
      rx * sizeOffset * Math.sin(t) +
      rx * 0.35 * secondaryMix * Math.sin(secondaryFrequency * t + secondaryPhase + phaseOffset);
    const y =
      cy +
      ry * sizeOffset * Math.sin(frequency * t + phaseOffset) * amplitude * tension +
      ry * 0.28 * Math.cos(t * (1.4 + symmetry * 0.6) + phaseOffset * 0.4) * symmetryFold;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function buildSpiralPath(settings, lineIndex, width, height) {
  const {
    spiralTurns, spiralGrowth, centerPull, innerVoid,
    ellipse, angularOffset, radialLineCount, densityBias,
    radialSpread, rotation,
    scale, yOffset,
  } = settings;

  const cx = width / 2;
  const cy = height / 2 + yOffset * height * 0.24;
  const maxR = Math.min(width, height) * 0.42 * scale;
  const mid = (radialLineCount - 1) / 2;
  const norm = radialLineCount <= 1 ? 0 : (lineIndex - mid) / mid;
  const lineScale = 1 + norm * radialSpread;
  const lineRotation = norm * angularOffset * TAU + rotation;
  const yScale = lerp(1, 0.54, ellipse);

  const densityMap = (t) => {
    if (densityBias === "center") return t ** 1.75;
    if (densityBias === "outer") return t ** 0.68;
    return t;
  };

  const growthBase = Math.max(-0.95, spiralGrowth);
  const growthCurve = (t) => {
    if (Math.abs(growthBase) < 0.001) return t;
    if (growthBase > 0) {
      return (Math.exp(growthBase * t) - 1) / (Math.exp(growthBase) - 1);
    }
    const k = Math.abs(growthBase);
    return 1 - ((Math.exp(k * (1 - t)) - 1) / (Math.exp(k) - 1));
  };

  let d = "";
  const steps = 1100;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const densityT = densityMap(t);
    const grownT = growthCurve(densityT);
    const pulledT = grownT ** lerp(0.72, 2.45, centerPull);
    const coreRadius = innerVoid * maxR;
    const radius = (coreRadius + (maxR - coreRadius) * pulledT) * lineScale;
    const angle = grownT * spiralTurns * TAU + lineRotation;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle) * yScale;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function HarmonicSvg({ settings }) {
  const width = 1400;
  const height = 840;

  const paths = useMemo(() => {
    const list = [];
    const totalLines = settings.mode === "vortex" ? settings.radialLineCount : settings.lineCount;
    for (let i = 0; i < totalLines; i += 1) {
      let d;
      if (settings.mode === "orbital") {
        d = buildOrbitalPath(settings, i, width, height);
      } else if (settings.mode === "vortex") {
        d = buildSpiralPath(settings, i, width, height);
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

function Section({ title, description, children }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="space-y-1">
        <div className="text-sm font-medium text-zinc-100">{title}</div>
        {description && <p className="text-xs leading-relaxed text-zinc-500">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

export default function App() {
  const [preset, setPreset] = useState("interference");
  const [settings, setSettings] = useState(PRESETS.interference);
  const [spiralProfile, setSpiralProfile] = useState("vortex");
  const isVortexMode = settings.mode === "vortex";

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (key) => {
    setPreset(key);
    const next = PRESETS[key];
    if (next.mode === "vortex") {
      setSpiralProfile("vortex");
      setSettings({ ...VORTEX_DEFAULTS, ...next, ...SPIRAL_PROFILES.vortex });
      return;
    }
    setSettings(next);
  };

  const changeMode = (mode) => {
    if (mode === "vortex") {
      setSpiralProfile("vortex");
    }
    setSettings((prev) => {
      if (mode === "vortex") {
        return {
          ...prev,
          ...VORTEX_DEFAULTS,
          ...SPIRAL_PROFILES.vortex,
          mode: "vortex",
        };
      }

      return {
        ...PRESETS[mode],
        ...prev,
        mode,
        xPadding: prev.xPadding ?? PRESETS[mode].xPadding,
      };
    });
  };

  const applySpiralProfile = (profileKey) => {
    setSpiralProfile(profileKey);
    setSettings((prev) => ({
      ...prev,
      ...VORTEX_DEFAULTS,
      ...SPIRAL_PROFILES[profileKey],
      mode: "vortex",
    }));
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

  const infoCards = (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4 text-sm text-zinc-400">
          <div className="mb-2 text-zinc-200">What changed</div>
          This pass adds form-level controls so the engine can shift from balanced studies toward more directional, compressed, or asymmetrical pieces.
        </CardContent>
      </Card>
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4 text-sm text-zinc-400">
          <div className="mb-2 text-zinc-200">Best new controls</div>
          Symmetry, Direction Bias, and Focal Compression are the fastest way to widen the family without adding a messy wall of sliders.
        </CardContent>
      </Card>
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4 text-sm text-zinc-400">
          <div className="mb-2 text-zinc-200">Next unlock</div>
          If you want even more range after this, the next upgrade should be a true radial or field mode rather than more waveform modifiers.
        </CardContent>
      </Card>
    </div>
  );

  const controls = (
    <Card className="border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/30 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">Harmonic Form Studio</CardTitle>
        <p className="text-sm text-zinc-400">
          Build poster-ready oscillation forms with clearer separation between structure, line behaviour, and composition.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section title="Preset & Form" description="Use presets for quick starting points, then switch the underlying form mode without losing your current tuning.">
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

          <div className="space-y-2">
            <Label>Form Mode</Label>
            <Select value={settings.mode} onValueChange={changeMode}>
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

          {isVortexMode && (
            <div className="space-y-2">
              <Label>Spiral Recipe</Label>
              <Select value={spiralProfile} onValueChange={applySpiralProfile}>
                <SelectTrigger className="border-zinc-800 bg-zinc-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vortex">Vortex Spiral</SelectItem>
                  <SelectItem value="open">Open Spiral</SelectItem>
                  <SelectItem value="shell">Shell Spiral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </Section>

        {!isVortexMode ? (
          <>
            <Section title="Structure" description="These sliders change the logic of the form, not just the amount of motion.">
              <Control label="Frequency" value={settings.frequency} min={0.5} max={14} step={0.1} onChange={(v) => update("frequency", v)} />
              <Control label="Amplitude" value={settings.amplitude} min={0.1} max={1.2} step={0.01} onChange={(v) => update("amplitude", v)} />
              <Control label="Symmetry" value={settings.symmetry} min={0} max={1} step={0.01} onChange={(v) => update("symmetry", v)} />
              <Control label="Direction Bias" value={settings.directionBias} min={-1} max={1} step={0.01} onChange={(v) => update("directionBias", v)} />
              <Control label="Focal Compression" value={settings.focalCompression} min={0} max={1} step={0.01} onChange={(v) => update("focalCompression", v)} />
              {settings.mode === "decay" && (
                <Control label="Damping" value={settings.damping} min={0.2} max={5} step={0.01} onChange={(v) => update("damping", v)} />
              )}
              <Control label="Secondary Mix" value={settings.secondaryMix} min={0} max={1} step={0.01} onChange={(v) => update("secondaryMix", v)} />
              <Control label="Secondary Frequency" value={settings.secondaryFrequency} min={0.5} max={18} step={0.1} onChange={(v) => update("secondaryFrequency", v)} />
              <Control label="Secondary Phase" value={settings.secondaryPhase} min={0} max={6.28} step={0.01} onChange={(v) => update("secondaryPhase", v)} />
            </Section>

            <Section title="Lines" description="Shape the trace density and the amount of woven separation between lines.">
              <Control label="Line Count" value={settings.lineCount} min={6} max={60} step={1} onChange={(v) => update("lineCount", Math.round(v))} />
              <Control label="Line Spread" value={settings.spread} min={0} max={0.5} step={0.01} onChange={(v) => update("spread", v)} />
              <Control label="Phase Spread" value={settings.phaseSpread} min={0} max={3} step={0.01} onChange={(v) => update("phaseSpread", v)} />
              <Control label="Stroke Weight" value={settings.thickness} min={0.4} max={2.2} step={0.01} onChange={(v) => update("thickness", v)} />
              <Control label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.01} onChange={(v) => update("opacity", v)} />
            </Section>

            <Section title="Composition" description="Control how the form sits on the poster and how much space it leaves to breathe.">
              <Control label="Scale" value={settings.scale} min={0.45} max={1.1} step={0.01} onChange={(v) => update("scale", v)} />
              <Control label="Vertical Offset" value={settings.yOffset} min={-1} max={1} step={0.01} onChange={(v) => update("yOffset", v)} />
              <Control label="Horizontal Padding" value={settings.xPadding} min={0.01} max={0.2} step={0.005} onChange={(v) => update("xPadding", v)} />
            </Section>

            <Section title="Display" description="Keep the axis line only where it helps the poster feel more structural and intentional.">
              <div className="flex items-center justify-between">
                <Label htmlFor="axis" className="text-zinc-200">Axis Line</Label>
                <Switch id="axis" checked={settings.axisLine} onCheckedChange={(v) => update("axisLine", v)} />
              </div>
            </Section>
          </>
        ) : (
          <>
            <Section title="Spiral Structure" description="A dedicated radial geometry system driven by turns, growth, center tension, and ellipse shaping.">
              <Control label="Spiral Turns" value={settings.spiralTurns} min={1.5} max={14} step={0.1} onChange={(v) => update("spiralTurns", v)} />
              <Control label="Spiral Growth" value={settings.spiralGrowth} min={-0.8} max={3.6} step={0.01} onChange={(v) => update("spiralGrowth", v)} />
              <Control label="Centre Pull" value={settings.centerPull} min={0} max={1} step={0.01} onChange={(v) => update("centerPull", v)} />
              <Control label="Inner Void" value={settings.innerVoid} min={0} max={0.55} step={0.01} onChange={(v) => update("innerVoid", v)} />
              <Control label="Ellipse" value={settings.ellipse} min={0} max={1} step={0.01} onChange={(v) => update("ellipse", v)} />
            </Section>

            <Section title="Spiral Density" description="Control trace layering and where density concentrates to keep the silhouette clean instead of muddy.">
              <Control label="Angular Offset" value={settings.angularOffset} min={0} max={0.9} step={0.01} onChange={(v) => update("angularOffset", v)} />
              <Control label="Radial Line Count" value={settings.radialLineCount} min={8} max={72} step={1} onChange={(v) => update("radialLineCount", Math.round(v))} />
              <Control label="Radial Spread" value={settings.radialSpread} min={0} max={0.4} step={0.01} onChange={(v) => update("radialSpread", v)} />
              <div className="space-y-2">
                <Label>Density Bias</Label>
                <Select value={settings.densityBias} onValueChange={(v) => update("densityBias", v)}>
                  <SelectTrigger className="border-zinc-800 bg-zinc-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="even">Even</SelectItem>
                    <SelectItem value="outer">Outer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Section>

            <Section title="Spiral Composition" description="Position and polish the spiral for restrained premium poster studies.">
              <Control label="Rotation" value={settings.rotation} min={0} max={6.28} step={0.01} onChange={(v) => update("rotation", v)} />
              <Control label="Spiral Scale" value={settings.scale} min={0.45} max={1.1} step={0.01} onChange={(v) => update("scale", v)} />
              <Control label="Vertical Offset" value={settings.yOffset} min={-1} max={1} step={0.01} onChange={(v) => update("yOffset", v)} />
              <Control label="Stroke Weight" value={settings.thickness} min={0.35} max={1.6} step={0.01} onChange={(v) => update("thickness", v)} />
              <Control label="Opacity" value={settings.opacity} min={0.2} max={0.95} step={0.01} onChange={(v) => update("opacity", v)} />
            </Section>
          </>
        )}

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
  );

  return (
    <div className="bg-zinc-950 text-zinc-100">
      <div className="flex flex-col h-screen overflow-hidden lg:hidden">
        <div className="flex-shrink-0 p-2 pt-3">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/30 p-2 shadow-2xl shadow-black/30">
            <HarmonicSvg settings={settings} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-4">
          {controls}
        </div>
      </div>

      <div className="hidden lg:block min-h-screen">
        <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[360px_1fr]">
          <div>{controls}</div>
          <div className="space-y-4">
            <div className="sticky top-4 z-20 space-y-4">
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/30 p-4 shadow-2xl shadow-black/30">
                <HarmonicSvg settings={settings} />
              </div>
              <div className="px-1">
                <div className="text-sm uppercase tracking-[0.22em] text-zinc-500">Current Study</div>
                <div className="mt-1 text-2xl font-medium text-zinc-100">{title}</div>
                <div className="text-sm text-zinc-500">{subtitle}</div>
              </div>
              {infoCards}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}