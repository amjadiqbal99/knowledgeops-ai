"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-2">
      {options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <button
            type="button"
            key={option.value}
            onClick={() =>
              onChange(
                checked ? value.filter((item) => item !== option.value) : [...value, option.value],
              )
            }
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm",
              checked ? "border-primary bg-primary/5" : "bg-background",
            )}
          >
            {option.label}
            {checked ? <Check className="h-4 w-4" /> : null}
          </button>
        );
      })}
    </div>
  );
}
