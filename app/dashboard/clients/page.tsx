"use client";

import { Building2, Download, Edit, Mail, MoreHorizontal, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ClientModal } from "@/components/modals/ClientModal";
import type { ClientRecord } from "@/lib/types";

interface ConfirmDialogState {
  isOpen: boolean;
  clientId: string | null;
  clientName: string | null;
}

async function fetchClients() {
  const res = await fetch("/api/clients");
  const json = await res.json();
  if (json.error) return [];
  return json.data?.data || [];
}

async function deleteClient(id: string) {
  const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "client" | "vendor">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDialogState>({
    isOpen: false,
    clientId: null,
    clientName: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const typeMatch = typeFilter === "all" || c.type === typeFilter;
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        c.name.toLowerCase().includes(searchLower) ||
        c.pan.toLowerCase().includes(searchLower) ||
        (c.email?.toLowerCase().includes(searchLower) ?? false) ||
        (c.phone?.toLowerCase().includes(searchLower) ?? false);
      return typeMatch && searchMatch;
    });
  }, [clients, typeFilter, searchQuery]);

  const handleDeleteClick = (client: ClientRecord) => {
    setConfirmDelete({
      isOpen: true,
      clientId: client.id,
      clientName: client.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.clientId) return;

    setIsDeleting(true);
    try {
      await deleteClient(confirmDelete.clientId);
      await loadClients();
      setConfirmDelete({ isOpen: false, clientId: null, clientName: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (client: ClientRecord) => {
    setSelectedClient(client);
    setShowCreateModal(true);
  };

  const handleExport = () => {
    const csv = [
      ["Name", "PAN", "Email", "Phone", "Type", "Total Invoices", "Total Amount"],
      ...filteredClients.map((c) => [
        c.name,
        c.pan,
        c.email || "",
        c.phone || "",
        c.type,
        c.total_invoices || 0,
        c.total_amount || 0,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clientCount = clients.filter((c) => c.type === "client").length;
  const vendorCount = clients.filter((c) => c.type === "vendor").length;

  return (
    <div className="space-y-6">
      {showCreateModal && (
        <ClientModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
          onCreated={() => {
            setShowCreateModal(false);
            setSelectedClient(null);
            loadClients();
          }}
          initialData={selectedClient || undefined}
        />
      )}

      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Delete Client</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Are you sure you want to delete <span className="font-semibold">{confirmDelete.clientName}</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete({ isOpen: false, clientId: null, clientName: null })}
                className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Clients & Vendors</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage your business contacts</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedClient(null);
            setShowCreateModal(true);
          }}
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
          <div className="text-sm font-medium text-[var(--ink-soft)]">Total Contacts</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{clients.length}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            placeholder="Search by name, PAN, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | "client" | "vendor")}
          className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
        >
          <option value="all">All Types</option>
          <option value="client">Clients</option>
          <option value="vendor">Vendors</option>
        </select>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg-elevated)]"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-white p-5 animate-pulse">
              <div className="h-4 w-32 rounded bg-[var(--border)]" />
              <div className="mt-4 h-3 w-24 rounded bg-[var(--border)]" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-40 rounded bg-[var(--border)]" />
                <div className="h-3 w-36 rounded bg-[var(--border)]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-[var(--ink-soft)]" />
          <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">No contacts found</h3>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {searchQuery || typeFilter !== "all" ? "Try adjusting your search filters" : "Add your first client or vendor to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)]/10 flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[var(--brand)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[var(--ink)] truncate">{client.name}</div>
                    <div className="text-xs text-[var(--ink-soft)]">PAN: {client.pan}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ml-2 ${
                    client.type === "client" ? "bg-[var(--brand-2)]/10 text-[var(--brand-2)]" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  }`}
                >
                  {client.type === "client" ? "Client" : "Vendor"}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)] truncate">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{client.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)] truncate">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{client.phone || "—"}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div>
                  <div className="text-xs text-[var(--ink-soft)]">{client.total_invoices || 0} invoices</div>
                  <div className="text-sm font-semibold text-[var(--ink)]">NPR {(client.total_amount || 0).toLocaleString()}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditClick(client)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--ink)]"
                    title="Edit client"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(client)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] transition hover:bg-red-100 hover:text-red-600"
                    title="Delete client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
