import React from "react";

// Este layout es requerido por Next.js en la raíz, aunque el middleware redirige a /[locale]
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
