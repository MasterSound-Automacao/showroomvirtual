import { useState } from 'react';
import Scene from './components/Scene';
import Hud from './components/Hud';

export type SceneMode = 'Off' | 'Welcome' | 'Cinema' | 'Test';

const DEFAULT_VOLUME = 0.6;

export default function App() {
  const [sceneMode, setSceneMode] = useState<SceneMode>('Off');
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [quality, setQuality] = useState<'high' | 'eco'>('high');
  const [isLocked, setIsLocked] = useState(false);

  const handleVolume = (value: number) => {
    setVolume(value);
    if (value > 0) {
      setMuted(false);
    }
  };

  const handleMute = () => {
    setMuted((prev) => !prev);
  };

  const handleQuality = () => {
    setQuality((prev) => (prev === 'high' ? 'eco' : 'high'));
  };

  const handleEnter = () => {
    setIsLocked(true);
    if (sceneMode === 'Off') {
      setSceneMode('Welcome');
    }
  };

  return (
    <div className="app">
      <Scene
        sceneMode={sceneMode}
        volume={volume}
        muted={muted}
        quality={quality}
        onLockChange={setIsLocked}
      />
      <Hud
        sceneMode={sceneMode}
        volume={volume}
        muted={muted}
        quality={quality}
        isLocked={isLocked}
        onSceneChange={setSceneMode}
        onVolumeChange={handleVolume}
        onMuteToggle={handleMute}
        onQualityToggle={handleQuality}
        onEnter={handleEnter}
      />
    </div>
  );
}
