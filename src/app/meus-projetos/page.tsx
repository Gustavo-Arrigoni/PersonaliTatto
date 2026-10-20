import { Suspense } from "react";
import { ProjectsScreen } from "@/components/client-flows";
export const metadata = { title: "Meus projetos · PersonaliTatto" };
export default function Page() {
  return (
    <Suspense>
      <ProjectsScreen />
    </Suspense>
  );
}
