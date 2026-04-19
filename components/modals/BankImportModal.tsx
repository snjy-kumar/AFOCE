"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface Props {
  onClose: () => void;
  onImported: (lines: unknown[]) => void;
}

export function BankImportModal({ onClose, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ""; });
      return obj;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError("Could not parse CSV. Ensure first row is headers: date, description, amount");
      } else {
        setPreview(parsed.slice(0, 5));
        setError(null);
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const text = await file.text();
    const rows = parseCSV(text);

    const res = await fetch("/api/bank-lines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: rows }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.error) {
      setError(json.error.message);
      return;
    }

    onImported(json.data || []);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-[var(--ink)]">Import Bank Statement</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Upload a CSV with columns: date, description, amount</p>

        <div className="mt-6 space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] p-8 cursor-pointer transition hover:border-[var(--brand)] hover:bg-[var(--bg-elevated)]"
          >
            <Upload className="h-8 w-8 text-[var(--ink-soft)]" />
            <p className="mt-2 text-sm font-medium text-[var(--ink)]">Click to upload CSV</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">date, description, amount columns required</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {preview.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="bg-[var(--bg-elevated)]/50 px-4 py-2 text-xs font-medium text-[var(--ink-soft)]">
                Preview (first {preview.length} rows)
              </div>
              <div className="divide-y divide-[var(--border)]">
                {preview.map((row, i) => (
                  <div key={i} className="px-4 py-2 text-sm">
                    <span className="font-mono text-xs text-[var(--ink-soft)]">{row.date}</span>{" "}
                    <span className="text-[var(--ink)]">{row.description}</span>{" "}
                    <span className="font-medium text-[var(--brand)]">NPR {row.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || preview.length === 0}
              className="rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f] disabled:opacity-50"
            >
              {loading ? "Importing..." : `Import ${preview.length} Lines`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
