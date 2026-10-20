"use client";
import dynamic from "next/dynamic";
export interface Model3DViewerProps {
  autoRotate?: boolean;
  lightMode?: "steel" | "contrast";
  resetKey?: number;
  className?: string;
}
const Scene = dynamic(() => import("./sphere-scene"), {
  ssr: false,
  loading: () => <div className="sphere-loading">CARREGANDO PRÉVIA 3D…</div>,
});
/** Replace only the scene renderer when anatomically rigged models are introduced. */
export function Model3DViewer(props: Model3DViewerProps) {
  return (
    <div
      className={`sphere-mount ${props.className || ""}`}
      aria-label="Prévia tridimensional: esfera interativa. Arraste para girar e use a roda do mouse ou dois dedos para aproximar."
    >
      <Scene {...props} />
    </div>
  );
}
