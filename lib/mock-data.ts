export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const publicNav: NavItem[] = [
  {
    href: "/features",
    label: "Features",
    description: "Explore compliance workflows and operational controls.",
  },
  {
    href: "/pricing",
    label: "Pricing",
    description: "Compare plans for founders, finance teams, and operators.",
  },
  {
    href: "/about",
    label: "About",
    description: "Understand the AFOCE operating model and market focus.",
  },
];

export const landingHeroStats: Metric[] = [
  {
    label: "Invoices issued this quarter",
    value: "24,892",
    detail: "With gapless IRD sequences and BS date support.",
  },
  {
    label: "Policy interventions",
    value: "1,482",
    detail: "Auto-stopped before they could hit the ledger.",
  },
  {
    label: "Reconciliation confidence",
    value: "97.4%",
    detail: "Suggested matches across bank lines and internal events.",
  },
];

export const trustBadges = [
  "IRD-ready invoice sequencing",
  "Native Bikram Sambat timeline",
  "Approval policy engine",
  "Immutable audit trails",
];

export const featureStories = [
  {
    eyebrow: "Compliance Core",
    title: "A ledger that refuses broken process.",
    description:
      "AFOCE blocks non-compliant actions before they create downstream cleanup. Large expenses without receipts never enter the ledger. High-value invoices can be routed into management review automatically.",
    bullets: [
      "Gapless invoice numbering aligned to IRD expectations",
      "13% VAT calculation on every invoice draft",
      "Expense rules by amount, category, and approver tier",
    ],
  },
  {
    eyebrow: "Operational Visibility",
    title: "Board-grade signals without accountant-only screens.",
    description:
      "Founders get receivables, cash position, tax exposure, and unresolved approvals as one operating picture. Teams drill into the underlying workflow without losing context.",
    bullets: [
      "Action queues tied directly to approval and collections work",
      "Month-end VAT snapshots with input and output tax clarity",
      "Live bank reconciliation suggestions and exception handling",
    ],
  },
  {
    eyebrow: "Local Intelligence",
    title: "Built for Nepali finance reality, not adapted after the fact.",
    description:
      "The platform carries BS dates, PAN and tax context, local compliance expectations, and familiar fiscal periods across the product surface.",
    bullets: [
      "BS and AD dates rendered side by side",
      "Local tax entities, customer PANs, and fiscal references",
      "Audit trail narratives readable by finance leadership",
    ],
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "Rs. 4,500",
    cadence: "/month",
    summary: "For founder-led teams replacing spreadsheets and legacy desktop tools.",
    features: [
      "Smart invoicing with VAT handling",
      "Expense logging and receipt enforcement",
      "Basic analytics and receivables tracking",
      "2 approvers and 3 business entities",
    ],
  },
  {
    name: "Growth",
    price: "Rs. 11,500",
    cadence: "/month",
    summary: "For finance-led operators managing multiple teams and tighter controls.",
    features: [
      "Multi-layer approval routing",
      "Bank reconciliation workspace",
      "VAT summaries and month-close cockpit",
      "Global action search and audit timeline",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    summary: "For groups needing custom policy logic, onboarding, and role segmentation.",
    features: [
      "Entity-level controls and approval matrices",
      "Advanced audit exports and workflow reviews",
      "Dedicated implementation support",
      "Custom dashboards and data hooks",
    ],
  },
];

export const dashboardNav = [
  { href: "/dashboard", label: "Command Center", short: "Overview" },
  { href: "/dashboard/invoices", label: "Smart Invoicing", short: "Invoices" },
  { href: "/dashboard/expenses", label: "Policy Engine", short: "Expenses" },
  { href: "/dashboard/reconciliation", label: "Bank Reconciliation", short: "Bank" },
  { href: "/dashboard/reports", label: "Reports & VAT", short: "Reports" },
  { href: "/dashboard/queues", label: "Approvals Queue", short: "Queues" },
  { href: "/dashboard/settings", label: "Workspace Settings", short: "Settings" },
];

export const commandCenterMetrics = [
  {
    label: "Net cash position",
    value: "Rs. 8.45M",
    detail: "+8.2% vs prior month",
  },
  {
    label: "Pending receivables",
    value: "Rs. 1.24M",
    detail: "5 invoices cross due date",
  },
  {
    label: "Immediate liabilities",
    value: "Rs. 430.5K",
    detail: "VAT clearance in 4 days",
  },
  {
    label: "Approval backlog",
    value: "7 items",
    detail: "2 are above CFO threshold",
  },
];

export const actionQueues = [
  {
    title: "Expenses above policy threshold",
    count: "3 waiting",
    owner: "Finance Controller",
    href: "/dashboard/expenses",
  },
  {
    title: "Overdue invoices needing follow-up",
    count: "5 accounts",
    owner: "Revenue desk",
    href: "/dashboard/invoices",
  },
  {
    title: "Bank lines with no confident match",
    count: "12 exceptions",
    owner: "Operations",
    href: "/dashboard/reconciliation",
  },
];

export const timelineEvents = [
  {
    time: "Today, 10:45",
    title: "Invoice AFO-2081-0046 approved and issued",
    detail: "Nexa Trading | Rs. 113,000 | VAT included",
  },
  {
    time: "Today, 09:10",
    title: "Flight expense routed to CFO approval",
    detail: "Rule: travel spend above Rs. 25,000",
  },
  {
    time: "Yesterday",
    title: "Recon engine matched 18 statement lines",
    detail: "Confidence above 96% auto-accepted",
  },
  {
    time: "Yesterday",
    title: "VAT workspace rolled into Baisakh 2081 close",
    detail: "Input tax Rs. 118,200 | Output tax Rs. 243,900",
  },
];

export const invoices = [
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
];

export const invoiceComposer = [
  { item: "Subscription implementation", qty: "1", rate: "Rs. 80,000", total: "Rs. 80,000" },
  { item: "Data migration", qty: "1", rate: "Rs. 20,000", total: "Rs. 20,000" },
  { item: "Training seats", qty: "5", rate: "Rs. 2,400", total: "Rs. 12,000" },
];

export const expenses = [
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
];

export const expensePolicies = [
  {
    title: "Receipt enforcement",
    detail: "Any expense above Rs. 5,000 requires a verified attachment before posting.",
  },
  {
    title: "Approval routing",
    detail: "Team leads approve to Rs. 20,000. Finance controller approves to Rs. 75,000.",
  },
  {
    title: "Escalation",
    detail: "Travel, marketing, and advance payments above threshold route to CFO.",
  },
];

export const bankLines = [
  {
    date: "2081-01-18",
    description: "NMB MOBILE CR NEXA TRADING",
    amount: "Rs. 113,000",
    match: "AFO-2081-0046",
    confidence: "99%",
  },
  {
    date: "2081-01-18",
    description: "ATM CASH WD ADMIN CASH",
    amount: "Rs. 20,000",
    match: "Possible petty cash top-up",
    confidence: "72%",
  },
  {
    date: "2081-01-19",
    description: "BANK CHARGE SMS ALERT",
    amount: "Rs. 350",
    match: "No internal event yet",
    confidence: "Unmatched",
  },
];

export const reportCards = [
  {
    title: "P&L snapshot",
    value: "Rs. 2.14M gross margin",
    detail: "Gross margin up 6.8% in Baisakh 2081",
  },
  {
    title: "Balance sheet",
    value: "Rs. 11.2M assets",
    detail: "Liabilities steady with tax reserve isolated",
  },
  {
    title: "Cash flow",
    value: "Rs. 630K net inflow",
    detail: "Collections improved after overdue workflow activation",
  },
];

export const vatSummary = {
  month: "Baisakh 2081",
  outputTax: "Rs. 243,900",
  inputTax: "Rs. 118,200",
  netPayable: "Rs. 125,700",
};

export const auditTrail = [
  {
    actor: "Automated Policy Engine",
    action: "Blocked expense EX-2081-097 from posting",
    detail: "Old state: pending draft | New state: rejected for missing receipt",
  },
  {
    actor: "Sanjay M.",
    action: "Approved invoice AFO-2081-0046",
    detail: "Old state: review | New state: issued and logged",
  },
  {
    actor: "Recon Engine",
    action: "Matched bank credit with invoice",
    detail: "Bank line 8812 linked to AFO-2081-0046 with 99% confidence",
  },
];

export const commandPaletteItems = [
  "Jump to invoice AFO-2081-0047",
  "Open approval queue",
  "Create invoice draft",
  "Review blocked expenses",
  "See VAT summary",
  "Open bank exceptions",
];
