// ... (Keep all Math functions and PRESETS at the top)

export default function App() {
  const [preset, setPreset] = useState("interference");
  const [settings, setSettings] = useState(PRESETS.interference);
  
  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const applyPreset = (key) => { setPreset(key); setSettings(PRESETS[key]); };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      {/* 1. STICKY PREVIEW */}
      <div className="w-full p-4 flex justify-center sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-zinc-800">
        <div className="w-full max-w-4xl aspect-[14/8.4] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
          <HarmonicSvg settings={settings} />
        </div>
      </div>

      {/* 2. ALL CONTROLS SECTION */}
      <div className="w-full max-w-lg p-6 space-y-10 pb-40">
        
        {/* PRESET SELECTOR */}
        <div className="space-y-3">
          <Label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Base Form</Label>
          <Select value={preset} onValueChange={applyPreset}>
            <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              {Object.keys(PRESETS).map(p => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PRIMARY CONTROLS */}
        <div className="space-y-8 border-t border-zinc-900 pt-6">
          <Label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Primary Oscillations</Label>
          <Control label="Frequency" value={settings.frequency} min={0.5} max={14} step={0.1} onChange={(v) => update("frequency", v)} />
          <Control label="Amplitude" value={settings.amplitude} min={0.1} max={1.2} step={0.01} onChange={(v) => update("amplitude", v)} />
          <Control label="Line Count" value={settings.lineCount} min={6} max={60} step={1} onChange={(v) => update("lineCount", v)} />
          <Control label="Line Spread" value={settings.spread} min={0} max={0.5} step={0.01} onChange={(v) => update("spread", v)} />
          <Control label="Phase Spread" value={settings.phaseSpread} min={0} max={3} step={0.01} onChange={(v) => update("phaseSpread", v)} />
        </div>

        {/* SECONDARY CONTROLS */}
        <div className="space-y-8 border-t border-zinc-900 pt-6">
          <Label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Secondary Harmonics</Label>
          <Control label="Secondary Mix" value={settings.secondaryMix} min={0} max={1} step={0.01} onChange={(v) => update("secondaryMix", v)} />
          <Control label="Sec. Frequency" value={settings.secondaryFrequency} min={0.5} max={18} step={0.1} onChange={(v) => update("secondaryFrequency", v)} />
          <Control label="Sec. Phase" value={settings.secondaryPhase} min={0} max={6.28} step={0.01} onChange={(v) => update("secondaryPhase", v)} />
          
          {settings.mode === "decay" && (
            <Control label="Damping" value={settings.damping} min={0.2} max={5} step={0.01} onChange={(v) => update("damping", v)} />
          )}
        </div>

        {/* VISUAL STYLING */}
        <div className="space-y-8 border-t border-zinc-900 pt-6">
          <Label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Composition</Label>
          <Control label="Stroke Weight" value={settings.thickness} min={0.4} max={2.2} step={0.01} onChange={(v) => update("thickness", v)} />
          <Control label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.01} onChange={(v) => update("opacity", v)} />
          <Control label="Scale" value={settings.scale} min={0.45} max={1.1} step={0.01} onChange={(v) => update("scale", v)} />
          
          <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
            <Label className="text-zinc-200">Axis Line</Label>
            <Switch checked={settings.axisLine} onCheckedChange={(v) => update("axisLine", v)} />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-6">
          <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-400" onClick={() => applyPreset(preset)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button className="flex-1 bg-white text-black hover:bg-zinc-200" onClick={() => {/* your download logic */}}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

      </div>
    </div>
  );
          }
