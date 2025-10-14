"use client";

import { Icons } from "@repo/ui/icons";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-background/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-md border bg-background px-4 py-3 shadow-sm">
        <Icons.spinner className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Cargando…</span>
      </div>
    </div>
  );
}

