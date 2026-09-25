import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Hydrate } from "@/components/Hydrate";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ProFuel · SUD CONTRACTORS",
  description:
    "Prototype de contrôle des flux carburant — empotage GESTOCI, transit, dépotage et rapprochement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-secondary">
        <Hydrate>{children}</Hydrate>
      </body>
    </html>
  );
}
