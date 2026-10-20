import type { Metadata } from "next";
import { Simulator } from "@/components/simulator";
export const metadata: Metadata = { title: "Prévia do simulador 3D" };
export default function Page() {
  return <Simulator />;
}
