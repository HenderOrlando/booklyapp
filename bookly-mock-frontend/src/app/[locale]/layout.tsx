import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";

// Importar DataModeIndicator solo en el cliente (evita SSR)
const DataModeIndicator = dynamic(
  () =>
    import("@/components/molecules/DataModeIndicator").then(
      (mod) => mod.DataModeIndicator,
    ),
  { ssr: false },
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookly - Sistema de Reservas Institucionales",
  description:
    "Sistema de gestión de reservas para recursos institucionales de la UFPS",
  keywords: ["reservas", "UFPS", "recursos", "institucional"],
  authors: [{ name: "Equipo Bookly" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <DataModeIndicator />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
