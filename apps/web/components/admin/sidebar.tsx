"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Film,
  Cpu,
  Rows,
  Tag,
  CreditCard,
  Settings,
  GraduationCap,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AdminNavMain } from "./admin-nav-main"
import { AdminNavUser } from "./admin-nav-user"

const data = {
  user: {
    name: "Admin User",
    email: "admin@aiseeekho.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Content",
      url: "/admin/content",
      icon: Film,
      items: [
        {
          title: "All Content",
          url: "/admin/content",
        },
        {
          title: "Upload New",
          url: "/admin/content/new",
        },
      ],
    },
    {
      title: "Tools Manager",
      url: "/admin/tools",
      icon: Cpu,
    },
    {
      title: "Rail Management",
      url: "/admin/rails",
      icon: Rows,
    },
    {
      title: "Organization",
      url: "#",
      icon: Tag,
      items: [
        {
          title: "Categories",
          url: "/admin/categories",
        },
        {
          title: "Trending Tags",
          url: "/admin/trending",
        },
      ],
    },
    {
      title: "Business",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Pricing Plans",
          url: "/admin/pricing",
        },
        {
          title: "Analytics",
          url: "/admin/analytics",
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 px-1">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-black tracking-tight uppercase">
                    AI Seekho
                  </span>
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
