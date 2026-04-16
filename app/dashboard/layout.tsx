"use client";

import CommandPalette from "@/components/dashboard/CommandPalette";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell min-h-screen">
      <Sidebar />
      <CommandPalette />
      <div className="sidebar-content transition-all duration-300 pl-[72px] lg:pl-64">
        <DashboardHeader />
        <main className="px-6 pb-8 pt-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}