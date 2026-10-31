import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useGLTF, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';
import ResonanceAudio from 'resonance-audio';
import type { SceneMode } from '../App';
import { ROOM_SIZE, SPEAKERS } from '../constants';

type SceneProps = {
  sceneMode: SceneMode;
  volume: number;
  muted: boolean;
  quality: 'high' | 'eco';
  onLockChange: (locked: boolean) => void;
};

type MovementState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sitting: boolean;
};

function PlayerControls({ onLockChange }: { onLockChange: (locked: boolean) => void }) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const movement = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sitting: false
  });

  useEffect(() => {
    const handleDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          movement.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          movement.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          movement.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          movement.current.right = true;
          break;
        case 'KeyE':
          movement.current.sitting = !movement.current.sitting;
          if (movement.current.sitting) {
            camera.position.set(0, 1.1, 0.8);
          } else {
            camera.position.set(0, 1.6, 2.4);
          }
          break;
      }
    };

    const handleUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          movement.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          movement.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          movement.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          movement.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [camera]);

  useFrame((_, delta) => {
    const speed = 5.5;
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(movement.current.forward) - Number(movement.current.backward);
    direction.current.x = Number(movement.current.right) - Number(movement.current.left);
    direction.current.normalize();

    if (!movement.current.sitting) {
      if (movement.current.forward || movement.current.backward) {
        velocity.current.z -= direction.current.z * speed * delta;
      }
      if (movement.current.left || movement.current.right) {
        velocity.current.x -= direction.current.x * speed * delta;
      }

      camera.position.x += velocity.current.x * delta;
      camera.position.z += velocity.current.z * delta;
    }
  });

  return (
    <PointerLockControls
      makeDefault
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}

function OptionalModel({ url, fallback }: { url: string; fallback: JSX.Element }) {
  const available = useRef(false);
  const [ready, setReady] = useMemo(() => [false, (v: boolean) => v], []);

  useEffect(() => {
    let active = true;
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (active) {
          available.current = res.ok;
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          available.current = false;
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  if (!ready || !available.current) {
    return fallback;
  }

  return <Model url={url} />;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Room() {
  const wallTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#14151b';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40000; i += 1) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(80,80,90,0.18)' : 'rgba(0,0,0,0.2)';
      ctx.fillRect(x, y, 2, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    return texture;
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[ROOM_SIZE.w, ROOM_SIZE.d]} />
        <meshStandardMaterial color="#0b0b0b" roughness={1} />
      </mesh>
      <mesh position={[0, ROOM_SIZE.h / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE.w, ROOM_SIZE.h, ROOM_SIZE.d]} />
        <meshStandardMaterial map={wallTexture ?? undefined} side={THREE.BackSide} />
      </mesh>

      <OptionalModel
        url="/assets/models/sofa.glb"
        fallback={
          <mesh position={[0, 0.4, 0.8]} castShadow>
            <boxGeometry args={[2.4, 0.4, 1.0]} />
            <meshStandardMaterial color="#101010" roughness={0.4} />
          </mesh>
        }
      />

      <OptionalModel
        url="/assets/models/speakers.glb"
        fallback={
          <group>
            {SPEAKERS.map((speaker) => (
              <mesh
                key={speaker.label}
                position={[speaker.x, speaker.y, speaker.z]}
                castShadow
              >
                <boxGeometry args={[0.3, 0.5, 0.3]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
            ))}
          </group>
        }
      />
    </group>
  );
}

function Screen() {
  const texture = useVideoTexture('/assets/video/demo.mp4', {
    muted: true,
    loop: true,
    start: false
  });

  return (
    <mesh position={[0, 2, -3.9]}>
      <planeGeometry args={[6, 3.4]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function AudioStage({ sceneMode, volume, muted }: Pick<SceneProps, 'sceneMode' | 'volume' | 'muted'>) {
  const { camera } = useThree();
  const audioCtx = useRef<AudioContext | null>(null);
  const resonance = useRef<ResonanceAudio | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const mediaElement = useRef<HTMLAudioElement | null>(null);
  const sources = useRef<ResonanceAudio.Source[]>([]);

  useEffect(() => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
      resonance.current = new ResonanceAudio(audioCtx.current);
      masterGain.current = audioCtx.current.createGain();
      masterGain.current.gain.value = muted ? 0 : volume;
      resonance.current.output.connect(masterGain.current);
      masterGain.current.connect(audioCtx.current.destination);

      resonance.current.setRoomProperties(
        { width: ROOM_SIZE.w, height: ROOM_SIZE.h, depth: ROOM_SIZE.d },
        {
          left: 'curtain-heavy',
          right: 'curtain-heavy',
          front: 'curtain-heavy',
          back: 'curtain-heavy',
          down: 'carpet-thick',
          up: 'acoustic-tile'
        }
      );

      mediaElement.current = new Audio('/assets/audio/showcase.mp3');
      mediaElement.current.loop = true;
      mediaElement.current.crossOrigin = 'anonymous';

      const mediaSource = audioCtx.current.createMediaElementSource(mediaElement.current);
      SPEAKERS.forEach((speaker) => {
        const source = resonance.current!.createSource();
        source.setPosition(speaker.x, speaker.y, speaker.z);
        const gain = audioCtx.current!.createGain();
        gain.gain.value = speaker.label.includes('Sub') ? 0.6 : 1.0;
        mediaSource.connect(gain);
        gain.connect(source.input);
        sources.current.push(source);
      });
    }
  }, [volume, muted]);

  useEffect(() => {
    if (!audioCtx.current || !masterGain.current) return;
    masterGain.current.gain.setTargetAtTime(muted ? 0 : volume, audioCtx.current.currentTime, 0.05);
  }, [volume, muted]);

  useEffect(() => {
    if (!audioCtx.current || !mediaElement.current) return;
    if (sceneMode === 'Cinema' || sceneMode === 'Test') {
      audioCtx.current.resume();
      mediaElement.current.play().catch(() => undefined);
    } else {
      mediaElement.current.pause();
    }
  }, [sceneMode]);

  useFrame(() => {
    if (!resonance.current) return;
    resonance.current.setListenerPosition(camera.position.x, camera.position.y, camera.position.z);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    resonance.current.setListenerOrientation(forward.x, forward.y, forward.z, 0, 1, 0);
  });

  return null;
}

export default function Scene({ sceneMode, volume, muted, quality, onLockChange }: SceneProps) {
  const dpr = quality === 'high' ? Math.min(window.devicePixelRatio, 1.6) : 1;

  return (
    <div className="canvas-shell">
      <Canvas
        shadows={quality === 'high'}
        dpr={dpr}
        camera={{ position: [0, 1.6, 2.4], fov: 75, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#0b0c0f']} />
        <fog attach="fog" args={['#0b0c0f', 7, 25]} />
        <ambientLight intensity={sceneMode === 'Off' ? 0.05 : 0.2} />
        <spotLight
          position={[-2, 3.8, -2]}
          angle={Math.PI / 5}
          intensity={sceneMode === 'Cinema' ? 0.0 : 1.2}
          castShadow={quality === 'high'}
        />
        <spotLight
          position={[2, 3.8, 2]}
          angle={Math.PI / 5}
          intensity={sceneMode === 'Cinema' ? 0.0 : 1.2}
          castShadow={quality === 'high'}
        />
        <rectAreaLight
          position={[0, 2, -3.9]}
          rotation={[0, Math.PI, 0]}
          intensity={sceneMode === 'Cinema' ? 3 : 0}
          width={6}
          height={3.4}
        />

        <Suspense fallback={null}>
          <Room />
          <Screen />
        </Suspense>

        <PlayerControls onLockChange={onLockChange} />
        <AudioStage sceneMode={sceneMode} volume={volume} muted={muted} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/assets/models/sofa.glb');
useGLTF.preload('/assets/models/speakers.glb');
