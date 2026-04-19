const NepaliMonths = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

export function ensureDemoData(): Record<string, unknown> {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randDate = () => `${randItem(NepaliMonths)} 2081`;
  const randAdDate = () => new Date(2024, rand(3, 11), rand(1, 28)).toISOString().split("T")[0];
  
  const clientNames = ["Nexa Trading", "Himal Retail", "Mountain View", "Kathmandu Electronics", "Everest Solutions", "Buddha Air", "S琪琪 Grocery", "Pashupatinath", "Lakeside Hospitality", "Summit Tech", "City Center Mall", "Royal Academy", "Adventure Travel", "Green Valley", "Sunrise Industries", "Temple View", "Dragon Restaurant", "Himalayan Airlines", "Nepal Trade", "Alpine Services"];
  const clientPans = Array.from({ length: 20 }, () => `${rand(100000, 999999)}${rand(100, 999)}`);
  const employeeNames = ["Ram Sharma", "Shyam KC", "Hari Bhatta", "Kiran Tamang", "Bikram Sth", "Nabin Joshi", "Santosh", "Prakash Rai", "Rajesh Mahar", "Dipesh Lama"];
  const expenseCategories = ["Travel", "Office Supplies", "Equipment", "Marketing", "Software", "Utilities", "Training", "Meals"];
  
  return {
    clients: Array.from({ length: 20 }, (_, i) => ({
      id: `CL-${String(i + 1).padStart(4, "0")}`,
      name: clientNames[i],
      pan: clientPans[i],
      email: `${clientNames[i].toLowerCase().replace(/\s+/g, ".")}@example.com`,
      type: i % 4 === 0 ? "vendor" : "client",
    })),
    policies: [
      { id: "POL-001", name: "Expense Limit Check", category: "expenses" },
      { id: "POL-002", name: "Invoice Approval", category: "invoicing" },
      { id: "POL-003", name: "Manager Auto-Approve", category: "approvals" },
      { id: "POL-004", name: "VAT Validation", category: "invoicing" },
      { id: "POL-005", name: "Budget Alert", category: "expenses" },
    ],
    invoices: Array.from({ length: 50 }, (_, i) => ({
      id: `INV-${String(i + 1).padStart(4, "0")}`,
      client_id: `CL-${String(rand(1, 20)).padStart(4, "0")}`,
      client_name: randItem(clientNames),
      client_pan: randItem(clientPans),
      bs_date: randDate(),
      ad_date: randAdDate(),
      due_days: rand(15, 45),
      amount: rand(5000, 200000),
      vat: Math.round(rand(5000, 200000) * 0.13),
      status: randItem(["paid", "pending", "overdue"]),
    })),
    expenses: Array.from({ length: 40 }, (_, i) => ({
      id: `EXP-${String(i + 1).padStart(4, "0")}`,
      employee: randItem(employeeNames),
      category: randItem(expenseCategories),
      amount: rand(500, 80000),
      bs_date: randDate(),
      ad_date: randAdDate(),
      status: randItem(["pending_approval", "approved", "rejected", "blocked"]),
      policy_id: "POL-001",
      policy_title: "Expense Limit Check",
    })),
    bankLines: Array.from({ length: 25 }, (_, i) => ({
      id: `BL-${rand(1000, 9999)}`,
      date: randDate(),
      description: `Bank transaction ${i + 1}`,
      amount: Math.abs(rand(-100000, 100000)),
      state: randItem(["matched", "needs_review", "unmatched"]),
      confidence: rand(60, 100),
    })),
  };
}

export function getDemoData(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("demo_data");
  if (stored) return JSON.parse(stored);
  return null;
}