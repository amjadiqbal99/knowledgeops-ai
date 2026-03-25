"use client";

import { ChevronsUpDown } from "lucide-react";

import { workspaceOptions } from "@/lib/constants";

export function WorkspaceSwitcher() {
  return (
    <button className="flex min-w-52 items-center justify-between rounded-lg border bg-card px-3 py-2 text-left text-sm">
      <div>
        <div className="text-xs text-muted-foreground">Workspace</div>
        <div className="font-medium">{workspaceOptions[0]}</div>
      </div>
      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
