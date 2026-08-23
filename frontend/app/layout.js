import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Text to SQL Engine | Natural Language Database Intelligence",
  description: "Transform natural language business questions into precise, optimized PostgreSQL queries with an intelligent multi-turn clarification engine.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f8f5] text-[#1f2d24] selection:bg-[#4ca873]/20 selection:text-[#184d32]">
        {children}
      </body>
    </html>
  );
}
