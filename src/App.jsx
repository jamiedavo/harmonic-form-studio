import React, { useMemo, useState, useEffect } from "react";
// Assuming these are your Shadcn imports
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Settings2, X } from "lucide-react";

// ... (Keep PRESETS, clamp, gaussian, buildWavePath, buildOrbitalPath, buildVortexPath exactly the same as your code)

function HarmonicSvg({ settings }) {
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

  return (
    <svg
      id="harmonic-poster-svg"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full object-contain bg-black transition-all duration-500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={width} height={height} fill="#000000" />
      {settings.axisLine && settings.mode !== "vortex" && (
        <line x1="120" y1={height / 2} x2={width - 120} y2={height / 2} stroke="rgba(255,255,255,0.78)" strokeWidth="1.1" />
      )}
      <g fill="none" stroke="#F5F3EE" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, i) => (
          <path key={i} d={d} strokeWidth={settings.thickness} strokeOpacity={settings.opacity * (0.45 + (i / Math.max(1, paths.length - 1)) * 0.55)} />
        ))}
      </g>
    </svg>
  );
}

function Control({ label, value, min, max, step = 0.01, onChange }) {
  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
        <Label className="text-[11px] uppercase tracking-wider">{label}</Label>
        <span className="tabular-nums bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{value.toFixed(2)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="py-1" />
    </div>
  );
}

export default function App() {
  const [preset, setPreset] = useState("interference");
  const [settings, setSettings] = useState(PRESETS.interference);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const applyPreset = (key) => {
    setPreset(key);
    setSettings(PRESETS[key]);
  };

  const downloadSvg = () => {
    const svg = document.getElementById("harmonic-poster-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harmonic-form.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden select-none">
      {/* --- MOBILE HEADER --- */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-900 bg-black/80 px-4 backdrop-blur-md z-50">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">Harmonic Studio</h1>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{settings.mode} mode</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={downloadSvg} className="h-9 w-9 text-zinc-400 hover:text-white">
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className={`h-9 gap-2 rounded-full px-4 text-xs font-bold transition-all ${isControlsOpen ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}
          >
            {isControlsOpen ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            {isControlsOpen ? "Close" : "Tweak"}
          </Button>
        </div>
      </header>

      {/* --- MAIN PREVIEW AREA --- */}
      <main className="relative flex flex-1 items-center justify-center p-4">
        <div className="h-full w-full max-w-4xl max-h-[60vh] flex items-center justify-center">
          <HarmonicSvg settings={settings} />
        </div>
      </main>

      {/* --- MOBILE CONTROL DRAWER --- */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-[60] transform bg-zinc-950/95 transition-transform duration-500 ease-out border-t border-zinc-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ${
          isControlsOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: '70dvh' }}
      >
        <div className="h-full flex flex-col">
          {/* Drawer Handle */}
          <div className="flex h-1.5 w-12 shrink-0 self-center rounded-full bg-zinc-800 my-3" />
          
          <div className="flex-1 overflow-y-auto px-6 pb-24">
            <div className="space-y-8 py-4">
              {/* Preset Selector */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Base Preset</Label>
                <Select value={preset} onValueChange={applyPreset}>
                  <SelectTrigger className="h-12 border-zinc-800 bg-zinc-900 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                    {Object.keys(PRESETS).map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sliders Group */}
              <div className="grid gap-2">
                <Control label="Frequency" value={settings.frequency} min={0.5} max={14} step={0.1} onChange={(v) => update("frequency", v)} />
                <Control label="Amplitude" value={settings.amplitude} min={0.1} max={1.2} step={0.01} onChange={(v) => update("amplitude", v)} />
                <Control label="Line Count" value={settings.lineCount} min={6} max={60} step={1} onChange={(v) => update("lineCount", Math.round(v))} />
                <Control label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.01} onChange={(v) => update("opacity", v)} />
                <Control label="Stroke" value={settings.thickness} min={0.4} max={2.2} step={0.01} onChange={(v) => update("thickness", v)} />
                
                <div className="flex items-center justify-between py-4 border-t border-zinc-900 mt-4">
                  <Label htmlFor="axis" className="text-zinc-200 uppercase text-[11px] tracking-wider font-bold">Axis Line</Label>
                  <Switch id="axis" checked={settings.axisLine} onCheckedChange={(v) => update("axisLine", v)} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 border-zinc-800 bg-transparent text-zinc-400" onClick={() => applyPreset(preset)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
