import Link from "next/link";

import { navigation } from "@/lib/constants";
import { isAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

export function SidebarNav({ role }: { role: Role }) {
  return (
    <nav className="space-y-1 p-4">
      {navigation
        .filter((item) => (item.href === "/users" ? isAdmin(role) : true))
        .map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}
