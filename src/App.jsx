   ort React, { useMemo, useState } from "react";
// Import your Shadcn components as usual

function HarmonicSvg({ settings }) {
  // SAFETY: If settings is missing, don't crash the app
  if (!settings) return <div style={{color: 'white'}}>Loading...</div>;

  const width = 1400;
  const height = 840;

  const paths = useMemo(() => {
    try {
      const list = [];
      // Safety default for lineCount
      const count = settings.lineCount ?? 20;
      for (let i = 0; i < count; i += 1) {
        let d = "";
        if (settings.mode === "orbital") d = buildOrbitalPath(settings, i, width, height);
        else if (settings.mode === "vortex") d = buildVortexPath(settings, i, width, height);
        else d = buildWavePath(settings, i, width, height);
        list.push(d);
      }
      return list;
    } catch (e) {
      console.error("Path generation failed", e);
      return [];
    }
  }, [settings]);

  return (
    <svg
      id="harmonic-poster-svg"
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={width} height={height} fill="#000000" />
      <g fill="none" stroke="#F5F3EE" strokeLinecap="round">
        {paths.map((d, i) => (
          <path 
            key={i} 
            d={d} 
            strokeWidth={settings.thickness ?? 1} 
            strokeOpacity={(settings.opacity ?? 0.8) * (0.45 + (i / paths.length) * 0.55)} 
          />
        ))}
      </g>
    </svg>
  );
}

export default function App() {
  const [preset, setPreset] = useState("interference");
  const [settings, setSettings] = useState(PRESETS.interference);

  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh', // Fallback for old browsers
      height: '100dvh',
      width: '100vw',
      backgroundColor: '#000',
      overflow: 'hidden',
      position: 'fixed',
      inset: 0
    }}>
      {/* HEADER */}
      <div style={{ 
        height: '60px', 
        padding: '0 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #333'
      }}>
        <span style={{ color: '#aaa', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px' }}>STUDIO</span>
        <Button size="sm" onClick={() => {/* download logic */}}>Export</Button>
      </div>

      {/* ART AREA - This is usually why it's blank. 
          The flex-grow ensures this takes up all space not used by the controls. */}
      <div style={{ 
        flexGrow: 1, 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ width: '100%', height: '100%', maxWidth: '500px' }}>
          <HarmonicSvg settings={settings} />
        </div>
      </div>

      {/* CONTROLS AREA - Fixed height at the bottom */}
      <div style={{ 
        height: '40%', 
        backgroundColor: '#0a0a0a', 
        borderTop: '1px solid #222',
        overflowY  
