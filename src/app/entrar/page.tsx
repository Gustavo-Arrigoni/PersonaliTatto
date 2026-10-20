import { Suspense } from "react";
import { AuthScreen } from "@/components/client-flows";
export const metadata = { title: "Entrar · PersonaliTatto" };
export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="login" />
    </Suspense>
  );
}
