import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PubkyProvider } from "@/lib/pubky-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PubkyTree | Decentralized Link-in-Bio",
  description: "Own your links, own your identity. A censorship-resistant alternative to Linktree powered by Pubky.",
  keywords: ["linktree", "decentralized", "pubky", "bio", "links", "web3"],
  authors: [{ name: "PubkyTree" }],
  openGraph: {
    title: "PubkyTree | Decentralized Link-in-Bio",
    description: "Own your links, own your identity. A censorship-resistant alternative to Linktree powered by Pubky.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PubkyTree | Decentralized Link-in-Bio",
    description: "Own your links, own your identity. A censorship-resistant alternative to Linktree powered by Pubky.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <PubkyProvider>
          {children}
        </PubkyProvider>
      </body>
    </html>
  );
}
