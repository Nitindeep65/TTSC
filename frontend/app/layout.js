import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Text to SQL Engine | Natural Language Database Intelligence",
  description: "Transform natural language business questions into precise, optimized PostgreSQL queries with an intelligent multi-turn clarification engine.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased scroll-smooth overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f7f8f5] text-[#17241c] selection:bg-[#4ca873]/25 selection:text-[#114227] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
