"use client";

import { Building2, Edit, Mail, MoreHorizontal, Phone, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { ClientModal } from "@/components/modals/ClientModal";

interface Client {
  id: string;
  name: string;
  pan: string;
  email: string | null;
  phone: string | null;
  type: string;
  total_invoices?: number;
  total_amount?: number;
}

async function fetchClients() {
  const res = await fetch("/api/clients");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let active = true;
    fetchClients().then((data) => { if (active) setClients(data); });
    return () => { active = false; };
  }, []);

  const handleCreated = () => {
    setShowCreate(false);
    fetchClients().then(setClients);
  };

  const clientCount = clients.filter((c) => c.type === "client").length;
  const vendorCount = clients.filter((c) => c.type === "vendor").length;

  return (
    <div className="space-y-6">
      {showCreate && <ClientModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Clients & Vendors</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage your business contacts</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111f36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3a8f]"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Clients</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{clientCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Vendors</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{vendorCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="text-sm font-medium text-[var(--ink-soft)]">Active This Month</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{clients.length}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            placeholder="Search contacts..."
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
          />
        </div>
        <select className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]">
          <option>All Types</option>
          <option>Clients</option>
          <option>Vendors</option>
        </select>
      </div>

      {/* Contacts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id} className="rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)]/10">
                  <Building2 className="h-5 w-5 text-[var(--brand)]" />
                </div>
                <div>
                  <div className="font-semibold text-[var(--ink)]">{client.name}</div>
                  <div className="text-xs text-[var(--ink-soft)]">PAN: {client.pan}</div>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                client.type === "client" ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]" : "bg-[var(--accent)]/10 text-[var(--accent)]"
              }`}>{client.type === "client" ? "Client" : "Vendor"}</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <Mail className="h-4 w-4" />{client.email || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <Phone className="h-4 w-4" />{client.phone || "—"}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <div>
                <div className="text-xs text-[var(--ink-soft)]">{client.total_invoices || 0} invoices</div>
                <div className="text-sm font-semibold text-[var(--ink)]">NPR {client.total_amount?.toLocaleString() || "0"}</div>
              </div>
              <div className="flex gap-1">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                  <Edit className="h-4 w-4" />
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
