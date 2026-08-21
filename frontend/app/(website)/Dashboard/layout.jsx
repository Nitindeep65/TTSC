import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar";
import { AppSidebar } from "./slidebar";


export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center border-b px-4">
          <SidebarTrigger />
          <div className="ml-3">
            <p className="text-sm font-medium">Query workspace</p>
            <p className="text-xs text-muted-foreground">Turn questions into SQL</p>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}