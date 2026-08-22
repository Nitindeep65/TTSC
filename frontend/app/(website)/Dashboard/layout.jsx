import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar"
import { AppSidebar } from "./slidebar"
import Link from "next/link"
import { Database, MessageSquareText, Sparkles } from "lucide-react"

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#f7f8f5]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e3e8e2] bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="h-5 w-px bg-[#e3e8e2]" />
            <div>
              <p className="text-sm font-semibold text-[#1f2d24]">Text to SQL Intelligence</p>
              <p className="text-[11px] text-[#6f7e75]">Postgres E-Commerce Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#d6e4d9] bg-[#edf7f0] px-3 py-1 text-xs font-medium text-[#246944] sm:inline-flex">
              <span className="size-2 rounded-full bg-[#4ca873] animate-pulse" />
              Llama-3.1 API Active
            </div>

            <Link
              href="/Dashboard/chat"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfddd0] bg-white px-3 py-1.5 text-xs font-semibold text-[#273d2f] shadow-2xs transition hover:bg-[#f1f6f2]"
            >
              <MessageSquareText className="size-3.5 text-[#4ca873]" />
              Chat Assistant
            </Link>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}