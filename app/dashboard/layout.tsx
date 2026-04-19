"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CommandPalette from "@/components/dashboard/CommandPalette";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/utils/supabase/client";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("demo_session") === "true";

      if (isDemo) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirectTo=/dashboard");
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  // Consistent root element – always the same structure.
  return (
    <div className="dashboard-shell min-h-screen">
      <Sidebar />
      <CommandPalette />
      <div className="sidebar-content transition-all duration-300 pl-[72px] lg:pl-64">
        <DashboardHeader />
        <main className="px-6 pb-8 pt-6">
          {loading ? (
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
            </div>
          ) : (
            <div className="mx-auto max-w-7xl">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}
