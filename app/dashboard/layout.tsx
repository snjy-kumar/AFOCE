import CommandPalette from "@/components/dashboard/CommandPalette";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <CommandPalette />
      <div className="xl:pl-[112px]">
        <DashboardHeader />
        <main className="px-4 pb-8 sm:px-6 xl:px-10">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
