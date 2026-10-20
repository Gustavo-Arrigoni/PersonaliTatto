import { Suspense } from "react";
import { AuthScreen } from "@/components/client-flows";
export const metadata = { title: "Criar conta · PersonaliTatto" };
export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="register" />
    </Suspense>
  );
}
