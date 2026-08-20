"use client";

import { Icons } from "@repo/ui/icons";

export default function GlobalLoading() {
  return (
    <div className="bg-background/60 fixed inset-0 z-[9999] grid place-items-center backdrop-blur-sm">
      <div className="bg-background flex items-center gap-3 rounded-md border px-4 py-3 shadow-sm">
        <Icons.spinner className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Cargando…</span>
      </div>
    </div>
  );
}
