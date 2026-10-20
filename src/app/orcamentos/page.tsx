import { Suspense } from "react";
import { QuotesScreen } from "@/components/client-flows";
export const metadata = { title: "Solicitar orçamento · PersonaliTatto" };
export default function Page() {
  return (
    <Suspense>
      <QuotesScreen />
    </Suspense>
  );
}
