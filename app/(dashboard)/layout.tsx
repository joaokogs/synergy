"use client";

import { useState } from "react";
import { Sidebar, SidebarContent } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="bg-pk-sidebar-bg p-0" showCloseButton={false}>
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex flex-1 flex-col overflow-auto bg-pk-card-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
