import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r bg-card lg:block">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Internal AI OS</span>
              <span className="text-lg font-semibold">Claude Ops OS</span>
            </Link>
          </div>
          <SidebarNav role={session.user.role} />
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
            <div className="flex h-16 items-center px-4 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="shrink-0">
                  <WorkspaceSwitcher />
                </div>
                <form action="/search" className="relative hidden max-w-xl flex-1 md:block">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="query"
                    placeholder="Search documents, workflows, QA logs, users..."
                    className="pl-9"
                  />
                </form>
              </div>
              <div className="ml-auto flex shrink-0 items-center">
                <UserNav user={session.user} />
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
