"use client";
import {
  Component,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box } from "lucide-react";
import type { Model3DViewerProps } from "./model-3d-viewer";

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}
function Fallback() {
  return (
    <div className="sphere-fallback">
      <div aria-hidden="true" />
      <span>
        <Box size={12} style={{ display: "inline", marginRight: 6 }} /> Prévia
        3D indisponível neste dispositivo
      </span>
      <span>Ative o WebGL para explorar a esfera.</span>
    </div>
  );
}
function EngravedSphere() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#909da5";
    ctx.fillRect(0, 0, 1024, 512);
    let seed = 47;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 21000; i++) {
      const brightness = Math.floor(85 + random() * 100);
      ctx.fillStyle = `rgba(${brightness},${brightness + 7},${brightness + 12},${random() * 0.3})`;
      const x = random() * 1024,
        y = random() * 512;
      ctx.fillRect(x, y, random() * 2 + 0.5, random() * 1.5 + 0.3);
    }
    ctx.lineWidth = 0.7;
    for (let l = 0; l < 42; l++) {
      ctx.beginPath();
      ctx.strokeStyle = l % 4 === 0 ? "#687e8c55" : "#344b5b40";
      for (let x = 0; x <= 1024; x += 3) {
        const y =
          256 +
          Math.sin((x / 1024) * Math.PI * 6 + l * 0.16) *
            Math.sin(l * 0.15) *
            125 +
          (l - 21) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group rotation={[0.2, 0, -0.14]}>
      <mesh>
        <sphereGeometry args={[1.47, 96, 64]} />
        <meshPhysicalMaterial
          color="#455966"
          map={texture}
          bumpMap={texture}
          bumpScale={0.018}
          roughness={0.53}
          metalness={0.82}
          clearcoat={0.22}
          clearcoatRoughness={0.45}
        />
      </mesh>
    </group>
  );
}
export default function SphereScene({
  autoRotate = true,
  lightMode = "steel",
  resetKey = 0,
}: Model3DViewerProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const context = c.getContext("webgl2") || c.getContext("webgl");
      setWebgl(!!context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebgl(false);
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    if (!holder.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={holder} style={{ height: "100%", width: "100%" }}>
      {webgl === null ? (
        <div className="sphere-loading">PRÉPARANDO O SEU UNIVERSO…</div>
      ) : !webgl ? (
        <Fallback />
      ) : (
        <SceneBoundary>
          <Canvas
            key={resetKey}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.15, 6.4], fov: 36 }}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            frameloop={visible ? "always" : "never"}
            onCreated={({ gl }) => {
              gl.setClearColor("#000000", 0);
            }}
          >
            <ambientLight intensity={0.48} color="#b3c6d4" />
            <directionalLight
              position={[-3, 4, 3]}
              color="#c1ddec"
              intensity={2.8}
            />
            <pointLight
              position={[-3, 1.1, 2]}
              color="#659fca"
              intensity={32}
              distance={9}
              decay={2}
            />
            <pointLight
              position={[3, 0.3, 0.4]}
              color={lightMode === "contrast" ? "#dc3b52" : "#ad3449"}
              intensity={lightMode === "contrast" ? 20 : 11}
              distance={8}
              decay={2}
            />
            <directionalLight
              position={[1, -2, -2]}
              color="#597e9b"
              intensity={1.8}
            />
            <EngravedSphere />
            <mesh position={[0, -1.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.1, 1.11, 96]} />
              <meshBasicMaterial color="#618da9" transparent opacity={0.28} />
            </mesh>
            <mesh position={[0, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.505, 96]} />
              <meshBasicMaterial color="#618da9" transparent opacity={0.12} />
            </mesh>
            <OrbitControls
              makeDefault
              autoRotate={autoRotate && !reduced && visible}
              autoRotateSpeed={0.38}
              enablePan={false}
              enableDamping
              dampingFactor={0.07}
              minDistance={4}
              maxDistance={9}
              minPolarAngle={0.55}
              maxPolarAngle={2.5}
              zoomSpeed={0.7}
            />
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
