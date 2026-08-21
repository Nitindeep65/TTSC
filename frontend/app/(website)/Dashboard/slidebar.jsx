import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar"
import {
  BarChart3,
  Database,
  FileText,
  HelpCircle,
  History,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

export function AppSidebar() {
  const workspaceItems = [
    { label: "Overview", href: "/Dashboard", icon: BarChart3 },
    { label: "New query", href: "/Dashboard?new=true", icon: Sparkles },
    { label: "Query history", href: "/Dashboard/history", icon: History },
  ]

  const resourceItems = [
    { label: "Data sources", href: "/Dashboard/sources", icon: Database },
    { label: "Saved queries", href: "/Dashboard/saved", icon: FileText },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="group-data-[collapsible=icon]:hidden">Text to SQL</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label} isActive={item.label === "Overview"}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/Dashboard/settings" />} tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} tooltip="Help center">
              <HelpCircle />
              <span>Help center</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/Login" />} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}