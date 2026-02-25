import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

import { MessageProvider } from "@/contexts/MessageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Palpita Aí | O Melhor do Futebol",
  description: "Plataforma de palpites esportivos premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <MessageProvider>
            {children}
          </MessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
