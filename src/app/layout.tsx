import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema OC",
  description: "Sistema de gestión de Órdenes de Compra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased min-h-screen bg-gray-50 text-gray-900`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
