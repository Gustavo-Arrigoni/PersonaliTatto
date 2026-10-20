import type { Metadata } from "next";
import { StudiosExplorer } from "@/components/discovery";
export const metadata: Metadata = { title: "Explorar estúdios" };
export default function Page() {
  return <StudiosExplorer />;
}
