"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, BarChart2, Settings, Table2Icon, Lock, Unlock } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/daily-stock', icon: Table2Icon, label: 'Daily Stock' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Stock Manager
        </h2>
        <div className="space-y-1">
          <Button asChild variant="secondary" className="w-full justify-start">
            <Link href="/daily-stock">
              <Table2Icon className="mr-2 h-4 w-4" />
              Daily Stock Table
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full justify-start">
            <Link href="/lock-day">
              <Lock className="mr-2 h-4 w-4" />
              Lock Day
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full justify-start">
            <Link href="/unlock-day">
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Day
            </Link>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}