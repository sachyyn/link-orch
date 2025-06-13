import {
  Calendar,
  Home,
  BarChart3,
  Users,
  FileText,
  Target,
  Settings,
  Plus,
  MessageSquare,
  Bot,
} from "lucide-react"
import Link from "next/link"

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
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"

// Menu items for main navigation
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Content",
    url: "/dashboard/content",
    icon: FileText,
  },
  {
    title: "AI Creator",
    url: "/dashboard/ai-creator",
    icon: Bot,
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Engagement",
    url: "/dashboard/engagement",
    icon: MessageSquare,
  },
  {
    title: "Leads",
    url: "/dashboard/leads",
    icon: Users,
  },
  {
    title: "Events",
    url: "/dashboard/events",
    icon: Target,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

// Quick action items
const quickActions = [
  {
    title: "New Post",
    url: "/dashboard/content/new",
    icon: Plus,
  },
  {
    title: "Create Event",
    url: "/dashboard/events/new",
    icon: Calendar,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">LM</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground">LinkedinMaster Pro</h2>
            <p className="text-xs text-sidebar-foreground/60">Professional Edition</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton asChild>
                    <Link href={action.url} className="flex items-center space-x-3">
                      <action.icon className="h-4 w-4" />
                      <span>{action.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
            <div className="text-sm">
              <p className="font-medium text-sidebar-foreground">Your Account</p>
              <p className="text-xs text-sidebar-foreground/60">Manage profile</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 