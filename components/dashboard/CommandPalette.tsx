"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { commandPaletteItems } from "@/lib/mock-data";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const openHandler = () => setOpen(true);

    window.addEventListener("keydown", handler);
    window.addEventListener("afoce:open-command-palette", openHandler);

    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("afoce:open-command-palette", openHandler);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commandPaletteItems;
    }

    return commandPaletteItems.filter((item) => item.toLowerCase().includes(normalized));
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[rgba(8,12,20,0.45)] px-4 py-8 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="mx-auto max-w-2xl rounded-[2rem] surface-dark p-4 text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3">
          <Search className="h-4 w-4 text-white/55" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search invoices, queues, reports..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
          />
          <div className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-white/45">
            esc
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {filtered.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setOpen(false)}
              className="block w-full rounded-[1.2rem] border border-white/8 bg-white/6 px-4 py-3 text-left text-sm text-white/78 transition hover:bg-white/10"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
