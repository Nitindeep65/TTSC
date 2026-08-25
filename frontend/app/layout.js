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
  title: "QueryCraft — Universal Text-to-SQL & NoSQL Database Engine",
  description: "Transform natural language into safe, production-ready PostgreSQL, MySQL, MongoDB MQL, DynamoDB, and Redis queries with live schema grounding and conversational clarification.",
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
