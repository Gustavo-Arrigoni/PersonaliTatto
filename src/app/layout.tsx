import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo-store";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://personalitatto-studio.arrigoni-senai.chatgpt.site",
  ),
  title: {
    default: "PersonaliTatto — A arte ganha corpo.",
    template: "%s | PersonaliTatto",
  },
  description:
    "Sua identidade, sua arte. Descubra estúdios, explore desenhos originais e organize sua próxima tatuagem. MVP demonstrativo com prévia 3D interativa.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "PersonaliTatto — A arte ganha corpo.",
    description:
      "Da primeira ideia à próxima tatuagem. Descubra uma nova forma de se expressar.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <DemoProvider>
          <SiteShell>{children}</SiteShell>
        </DemoProvider>
      </body>
    </html>
  );
}
