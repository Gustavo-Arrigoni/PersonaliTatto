import type { Metadata } from "next";
import { Gallery } from "@/components/discovery";
export const metadata: Metadata = { title: "Galeria de artes" };
export default function Page() {
  return <Gallery />;
}
