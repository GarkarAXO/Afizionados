import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AFIZIONADOS | La Arena para Coleccionistas",
  description: "Memorabilia deportiva autenticada y piezas únicas de colección.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
        />
      </head>
      <body className={`${inter.variable} font-sans bg-background-light dark:bg-background-dark text-gray-900 dark:text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
