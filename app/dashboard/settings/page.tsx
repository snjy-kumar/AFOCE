"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Globe,
  Lock,
  ShieldCheck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";

const settingsSections = [
  {
    title: "Profile Settings",
    description: "Update your name, photo, company and personal information",
    icon: UserCircle,
    href: "/dashboard/settings/profile",
  },
  {
    title: "Security & Password",
    description: "Change password, manage sessions and account security",
    icon: Lock,
    href: "/dashboard/settings/security",
  },
  {
    title: "Business Profile",
    description: "Business PAN, legal entity, and contact information",
    icon: Building2,
    href: "/dashboard/settings/business",
  },
  {
    title: "Fiscal Settings",
    description: "Fiscal year defaults and BS reporting periods",
    icon: Calendar,
    href: "/dashboard/settings/fiscal",
  },
  {
    title: "Approval Rules",
    description: "Approval thresholds by role and category",
    icon: ShieldCheck,
    href: "/dashboard/settings/approvals",
  },
  {
    title: "Expense Policies",
    description: "Receipt rules and expense policy configuration",
    icon: CreditCard,
    href: "/dashboard/settings/expenses",
  },
  {
    title: "Invoice Templates",
    description: "Customize invoice layout and branding",
    icon: FileText,
    href: "/dashboard/settings/invoices",
  },
  {
    title: "Payment Methods",
    description: "Bank accounts and payment integration",
    icon: Wallet,
    href: "/dashboard/settings/payments",
  },
  {
    title: "Team & Permissions",
    description: "Manage team members and access levels",
    icon: Users,
    href: "/dashboard/settings/team",
  },
  {
    title: "Localization",
    description: "Language, currency, and regional settings",
    icon: Globe,
    href: "/dashboard/settings/localization",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Manage workspace configuration
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 text-left transition hover:border-[var(--brand)] hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10">
              <section.icon className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[var(--ink)]">
                {section.title}
              </div>
              <div className="mt-1 text-sm text-[var(--ink-soft)]">
                {section.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Workspace Info */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="font-semibold text-[var(--ink)]">Workspace Info</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm text-[var(--ink-soft)]">Workspace Name</div>
            <div className="mt-1 font-semibold text-[var(--ink)]">
              AFOCE Advisory Labs
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--ink-soft)]">
              Current Fiscal Year
            </div>
            <div className="mt-1 font-semibold text-[var(--ink)]">2081/82</div>
          </div>
          <div>
            <div className="text-sm text-[var(--ink-soft)]">Active Period</div>
            <div className="mt-1 font-semibold text-[var(--ink)]">
              Baisakh 2081
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--ink-soft)]">Base Currency</div>
            <div className="mt-1 font-semibold text-[var(--ink)]">
              NPR (Rs.)
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-[var(--danger)]/20 bg-white p-6">
        <h2 className="font-semibold text-[var(--danger)]">Danger Zone</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Irreversible actions for this workspace
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="rounded-xl border border-[var(--danger)]/30 bg-white px-4 py-2 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/5"
          >
            Export All Data
          </button>
          <button
            type="button"
            className="rounded-xl border border-[var(--danger)]/30 bg-white px-4 py-2 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/5"
          >
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
