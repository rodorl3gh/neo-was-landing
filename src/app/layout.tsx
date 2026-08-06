import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Neo Was | Impulsamos negocios con estrategias digitales",
  description:
    "Agencia de marketing digital, redes sociales, paginas web, publicidad, IA y consultoria para negocios que quieren crecer.",
  keywords: [
    "marketing digital",
    "paginas web",
    "redes sociales",
    "publicidad",
    "inteligencia artificial",
    "consultoria",
    "Mexico",
  ],
  openGraph: {
    title: "Neo Was | Estrategias digitales que generan clientes",
    description:
      "Impulsamos negocios con estrategias digitales que generan clientes y ventas.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-obsidian-950 text-text-primary">
        {children}
      </body>
    </html>
  );
}
