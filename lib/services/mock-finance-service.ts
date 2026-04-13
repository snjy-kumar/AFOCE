export type InvoiceStatus = "Paid" | "Overdue" | "Pending" | "Draft";
export type ExpenseStatus = "Pending approval" | "Manager review" | "Blocked" | "Approved" | "Rejected";

export type InvoiceRecord = {
  id: string;
  client: string;
  pan: string;
  bsDate: string;
  adDate: string;
  amount: string;
  vat: string;
  status: InvoiceStatus;
};

export type ExpenseRecord = {
  id: string;
  employee: string;
  category: string;
  amount: string;
  bsDate: string;
  status: ExpenseStatus;
  policy: string;
  receipt: "Attached" | "Missing";
};

export type BankLineRecord = {
  id: string;
  date: string;
  description: string;
  amount: string;
  match: string;
  confidence: string;
  state: "Matched" | "Needs review";
};

const invoices: InvoiceRecord[] = [
  {
    id: "AFO-2081-0046",
    client: "Nexa Trading Pvt. Ltd.",
    pan: "609441287",
    bsDate: "2081-01-12",
    adDate: "2024-04-24",
    amount: "Rs. 113,000",
    vat: "Rs. 13,000",
    status: "Paid",
  },
  {
    id: "AFO-2081-0047",
    client: "Himal Retail Network",
    pan: "301998144",
    bsDate: "2081-01-14",
    adDate: "2024-04-26",
    amount: "Rs. 45,200",
    vat: "Rs. 5,200",
    status: "Overdue",
  },
  {
    id: "AFO-2081-0048",
    client: "Everest Systems",
    pan: "504000211",
    bsDate: "2081-01-17",
    adDate: "2024-04-29",
    amount: "Rs. 78,500",
    vat: "Rs. 9,035",
    status: "Pending",
  },
  {
    id: "AFO-2081-0049",
    client: "Lagankhel Foods",
    pan: "402199542",
    bsDate: "2081-01-18",
    adDate: "2024-04-30",
    amount: "Rs. 212,160",
    vat: "Rs. 24,400",
    status: "Draft",
  },
  {
    id: "AFO-2081-0050",
    client: "Mero Logistics",
    pan: "512880034",
    bsDate: "2081-01-20",
    adDate: "2024-05-02",
    amount: "Rs. 332,780",
    vat: "Rs. 38,280",
    status: "Pending",
  },
];

let expenses: ExpenseRecord[] = [
  {
    id: "EX-2081-095",
    employee: "Rahul Shah",
    category: "Travel",
    amount: "Rs. 45,000",
    bsDate: "2081-01-12",
    status: "Pending approval",
    policy: "Amount exceeds automatic threshold of Rs. 25,000",
    receipt: "Attached",
  },
  {
    id: "EX-2081-096",
    employee: "Sneha Poudel",
    category: "Meals",
    amount: "Rs. 8,500",
    bsDate: "2081-01-14",
    status: "Manager review",
    policy: "Team meal requires manager acknowledgement",
    receipt: "Attached",
  },
  {
    id: "EX-2081-097",
    employee: "Aayush Karki",
    category: "Office supplies",
    amount: "Rs. 12,000",
    bsDate: "2081-01-15",
    status: "Blocked",
    policy: "Receipt required above Rs. 5,000",
    receipt: "Missing",
  },
  {
    id: "EX-2081-098",
    employee: "Nima Sherpa",
    category: "Marketing",
    amount: "Rs. 78,000",
    bsDate: "2081-01-16",
    status: "Pending approval",
    policy: "Campaign spend above Rs. 50,000 needs controller + CFO",
    receipt: "Attached",
  },
];

let bankLines: BankLineRecord[] = [
  {
    id: "BL-8812",
    date: "2081-01-18",
    description: "NMB MOBILE CR NEXA TRADING",
    amount: "Rs. 113,000",
    match: "AFO-2081-0046",
    confidence: "99%",
    state: "Matched",
  },
  {
    id: "BL-8813",
    date: "2081-01-18",
    description: "ATM CASH WD ADMIN CASH",
    amount: "Rs. 20,000",
    match: "Possible petty cash top-up",
    confidence: "72%",
    state: "Needs review",
  },
  {
    id: "BL-8814",
    date: "2081-01-19",
    description: "BANK CHARGE SMS ALERT",
    amount: "Rs. 350",
    match: "No internal event yet",
    confidence: "Unmatched",
    state: "Needs review",
  },
];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getInvoices() {
  await delay();
  return [...invoices];
}

export async function getExpenses() {
  await delay();
  return [...expenses];
}

export async function updateExpenseStatus(id: string, status: ExpenseStatus) {
  await delay(120);
  expenses = expenses.map((entry) => (entry.id === id ? { ...entry, status } : entry));
  return [...expenses];
}

export async function getBankLines() {
  await delay();
  return [...bankLines];
}

export async function markBankLine(id: string, state: BankLineRecord["state"]) {
  await delay(120);
  bankLines = bankLines.map((entry) => (entry.id === id ? { ...entry, state } : entry));
  return [...bankLines];
}

export async function getDashboardSnapshot() {
  await delay(90);

  const overdue = invoices.filter((entry) => entry.status === "Overdue").length;
  const pendingApprovals = expenses.filter(
    (entry) => entry.status === "Pending approval" || entry.status === "Manager review",
  ).length;
  const blocked = expenses.filter((entry) => entry.status === "Blocked").length;
  const unmatched = bankLines.filter((entry) => entry.state === "Needs review").length;

  return {
    overdue,
    pendingApprovals,
    blocked,
    unmatched,
  };
}
