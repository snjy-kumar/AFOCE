# AFOCE Accounting Platform - Feature Guide

## User-Facing Feature Documentation

### 📄 Invoicing System

#### Creating Invoices
1. Navigate to **Invoices** from the sidebar
2. Click **+ New Invoice** button
3. Fill in the form:
   - **Client**: Select from dropdown (create new if needed)
   - **BS Date**: Buddhist era date (e.g., "Baisakh 2081")
   - **AD Date**: Gregorian date (2024-04-14)
   - **Due Days**: Payment term (30 days default)
   - **Amount**: Invoice total (excluding VAT)
   - **Items** (optional): Add line items with description, quantity, rate
   - **Notes**: Payment terms or special instructions
4. Click **Create Invoice**
5. Invoice will be in "Draft" status by default

#### Invoice Workflow
```
Draft → Pending → Paid
              ↘ Overdue (if due_days exceeded)
              ↘ Rejected (if client rejects)
```

#### Managing Invoice Status
- **Mark as Sent**: Change from Draft to Pending
- **Mark as Paid**: Update status to Paid (records payment date)
- **Mark as Overdue**: Automatically calculated after due date
- **Reject**: Cancel invoice if needed

#### Invoice Features
- **View Details**: Click invoice row to see full details
- **Download PDF**: Export invoice as PDF for printing/sharing
- **Export to CSV**: Bulk export all invoices
- **Search**: Filter by invoice number, client name, status
- **Filter**: By status (paid, pending, overdue, rejected)
- **Batch Actions**: Select multiple invoices to mark paid, delete, or export

#### VAT Calculation
- VAT is automatically calculated at 13% (Nepal standard)
- VAT is shown separately on invoice
- Total includes VAT amount
- VAT is tracked for filing

---

### 💰 Expense Management

#### Creating Expenses
1. Go to **Expenses** section
2. Click **+ New Expense**
3. Fill in details:
   - **Employee Name**: Person submitting expense
   - **Category**: Travel, Office Supplies, Meals, etc.
   - **Amount**: Expense amount (in NPR)
   - **BS Date**: Buddhist era date
   - **AD Date**: Gregorian date
   - **Receipt**: Upload receipt image/PDF (optional)
   - **Description**: Details about the expense
4. Click **Submit for Approval**

#### Expense Approval Workflow
```
Pending Approval → Manager Review → Approved
                              ↘ Blocked (if violates policy)
                              ↘ Rejected
```

#### Approval Process
1. **Policy Checking**: System automatically checks against expense policies
2. **Manager Review**: If amount exceeds policy limits, manager reviews
3. **Auto-Approval**: Small expenses may auto-approve if policy allows
4. **Approval Email**: Approvers get email notifications

#### Policy Enforcement
- **Amount Limits**: Different categories have different limits
- **Receipt Requirement**: Some categories require receipt proof
- **Approval Chain**: Large expenses need multiple approvals
- **Budget Tracking**: Expenses counted against category budget

#### Expense Features
- **Receipt Upload**: Drag-and-drop receipt images or PDFs
- **Policy Compliance**: Shows if expense matches policies
- **Batch Actions**: Approve/reject multiple expenses at once
- **Search & Filter**: By employee, category, status, date range
- **Export**: Download all expenses as CSV

---

### 👥 Client Management

#### Adding Clients
1. Go to **Clients**
2. Click **+ New Client**
3. Enter details:
   - **Name**: Business/person name
   - **PAN**: Permanent Account Number (9 digits)
   - **Type**: Client or Vendor
   - **Email**: Contact email
   - **Phone**: Contact phone number
   - **Address**: Business address
4. Click **Create Client**

#### Client Types
- **Client**: Party to whom you issue invoices
- **Vendor**: Party from whom you purchase (for expenses)

#### Client Features
- **View All Invoices**: See invoices issued to client
- **Total Amount**: Sum of all invoice amounts with that client
- **Search**: By name, PAN, email
- **Batch Delete**: Remove multiple clients
- **Export**: Download client list as CSV

#### PAN Validation
- PAN must be exactly 9 digits
- PAN uniqueness enforced (can't have duplicates)
- Used for tax reporting and VAT filing

---

### 🏦 Bank Reconciliation

#### Importing Bank Statements
1. Go to **Reconciliation**
2. Click **Import Statement**
3. Upload bank statement file (CSV format)
4. System processes and displays transactions

#### Matching Process
1. System auto-matches obvious transactions
2. Shows **Matched** transactions (green checkmark)
3. Shows **Needs Review** (yellow flag) for uncertain matches
4. Shows **Unmatched** (red) for unmatchable transactions

#### Manual Matching
1. Click transaction row to see details
2. System suggests matches based on:
   - Amount match
   - Date proximity
   - Description similarity
3. Confirm match or reject suggestion

#### Reconciliation Status
- **Matched**: Transaction is reconciled with invoice/expense
- **Unmatched**: No matching invoice/expense found
- **Confidence**: Shows matching confidence percentage

#### Benefits
- **Verify Payments**: Ensure all invoices are paid
- **Detect Discrepancies**: Find missing or incorrect transactions
- **Track Cash Flow**: Monitor actual bank movements
- **Audit Trail**: Historical record of all reconciliations

---

### 📊 Reports & Analytics

#### Dashboard Metrics
The main dashboard shows:
- **Total Revenue**: Sum of all paid invoices
- **Total Expenses**: Sum of all approved expenses
- **Pending Amount**: Invoices awaiting payment
- **Pending Approvals**: Expenses awaiting approval
- **Cash Position**: Revenue minus expenses

#### Revenue Trends
- **Monthly Breakdown**: Revenue by month (12-month view)
- **Trend Line**: See growth/decline over time
- **Comparison**: Compare to previous month

#### Expense Breakdown
- **By Category**: Pie chart of expense categories
- **Top Categories**: Which categories cost most
- **Trend**: Category spending over time

#### VAT Reports
1. Go to **Reports** → **VAT Report**
2. Select period (monthly, quarterly, yearly)
3. System calculates:
   - **Output VAT**: VAT on invoices issued (13%)
   - **Input VAT**: VAT on expenses incurred (13%)
   - **Net VAT Payable**: Output minus Input
   - **Filing Due Date**: When VAT is due (20 days after period)

#### Audit Logs
1. Go to **Reports** → **Audit Logs**
2. View all system activities:
   - Who did what, when
   - Changes to invoices, expenses, clients
   - Approvals, rejections, deletions
   - Export for compliance

#### Exporting Reports
- **PDF**: Professional formatted report
- **CSV**: Spreadsheet format for further analysis
- **Excel**: Full workbook with charts
- **Email**: Send report directly via email

---

### 👨‍💼 Team Management

#### Adding Team Members
1. Go to **Settings** → **Team**
2. Click **Invite Member**
3. Enter email address
4. Select role:
   - **Finance Admin**: Full access to all features
   - **Manager**: Can approve expenses, view reports
   - **Team Member**: Can submit expenses, limited access
5. Send invite

#### Role Permissions
| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| Create Invoice | ✓ | ✓ | ✗ |
| Approve Expense | ✓ | ✓ | ✗ |
| View Reports | ✓ | ✓ | ✗ |
| Manage Team | ✓ | ✗ | ✗ |
| Submit Expense | ✓ | ✓ | ✓ |
| View Dashboard | ✓ | ✓ | ✓ |

#### Managing Members
- **View Pending Invites**: See who hasn't accepted yet
- **Change Role**: Update member's role
- **Remove Member**: Revoke access
- **Resend Invite**: Send invite link again

---

### ⚙️ Settings & Configuration

#### Profile Settings
1. Go to **Settings** → **Profile**
2. Update:
   - **Organization Name**: Your business name
   - **PAN**: Your business PAN
   - **Email**: Primary contact email
   - **Phone**: Contact phone
   - **Address**: Business address
   - **Currency**: Currency for amounts (NPR default)
3. Click **Save**

#### Security Settings
1. Go to **Settings** → **Security**
2. **Change Password**: Update your login password
3. **Two-Factor Authentication**: Enable for extra security
4. **Active Sessions**: View and manage login sessions
5. **Account Recovery**: Set recovery email

#### Preferences
- **Language**: Interface language
- **Timezone**: Your timezone for dates/times
- **Email Notifications**: Which events trigger emails
- **Display Preferences**: Theme (light/dark), decimal places

---

### 📤 Exporting Data

#### CSV Export
- Comma-separated values format
- Compatible with Excel, Google Sheets
- Includes all fields from view
- Downloads as: `invoices_2024-01-15.csv`

#### PDF Export
- Professional formatted reports
- Includes logo, headers, footers
- Page numbers and date
- Print-friendly

#### Batch Export
1. Select multiple items (checkboxes)
2. Click **Export Selected**
3. Choose format (CSV/PDF)
4. File downloads automatically

#### Email Report
1. Click **Email Report**
2. Enter recipient email
3. Choose format and delivery schedule
4. System sends automatically

---

### 📧 Email Notifications

#### When You Receive Emails
- **Invoice Created**: Confirmation when new invoice created
- **Invoice Overdue**: Reminder when invoice past due date
- **Expense Approval**: Request when expense needs your approval
- **Expense Status**: Confirmation of approval/rejection
- **Weekly Summary**: Every Monday with week's activity
- **VAT Reminder**: 5 days before VAT filing due date
- **Password Reset**: When resetting account password

#### Configuring Notifications
1. Go to **Settings** → **Notifications**
2. Toggle email settings:
   - Invoice notifications
   - Expense notifications
   - Report notifications
   - Team notifications
3. Click **Save**

#### In-App Notifications
- Bell icon in top navigation
- Shows recent activity
- Click to dismiss or view details
- Unread count shown

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl+N` / `Cmd+N` - New item
- `Ctrl+S` / `Cmd+S` - Save
- `Ctrl+E` / `Cmd+E` - Export
- `Esc` - Close modal/dialog

### Status Colors
- 🟢 **Green** - Approved, Paid, Matched
- 🟡 **Yellow** - Pending, Review needed
- 🔴 **Red** - Overdue, Rejected, Blocked
- 🔵 **Blue** - Draft, New

### Amount Format
- All amounts shown in NPR (Nepalese Rupees)
- Thousands separator: commas (1,00,000)
- Decimals: 2 places (.00)
- VAT: Automatically calculated at 13%

### Date Formats
- **BS Date**: "Baisakh 2081" (Buddhist era)
- **AD Date**: "2024-04-14" (Gregorian)
- System converts automatically

---

## Troubleshooting

### Invoice not sending?
- Check client email is correct
- Verify email notifications enabled in settings
- Check spam folder

### Expense stuck in "Manager Review"?
- Manager may need reminder email
- Check manager's inbox or spam
- Try approving again from dashboard

### VAT amount incorrect?
- VAT is calculated as 13% of amount
- Ensure amount is without VAT
- Contact support if calculation seems wrong

### Can't upload receipt?
- File must be under 10MB
- Supported formats: JPG, PNG, PDF
- Ensure internet connection stable

---

## Support & Help

**For help:**
- In-app help: ? icon in navigation
- Email: support@afoce.app
- Documentation: https://docs.afoce.app
- Status: https://status.afoce.app

**Report Issues:**
- Use "Report Bug" button in settings
- Include: what happened, when, which page
- Attach screenshot if possible

---

*Last Updated: 2026-05-03*
*Version: 1.0.0*
