import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    panNumber?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice?: number;
    rate?: number;
    total?: number;
    amount?: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discountAmount: number;
  totalAmount?: number;
  total?: number;
  notes?: string;
  status: string;
}

interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  panNumber?: string;
  logo?: string;
}

export const generateInvoicePDF = (
  invoice: InvoiceData,
  businessInfo: BusinessInfo
) => {
  const toNumber = (value: unknown, fallback = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };
  const formatCurrency = (value: number) =>
    `रू ${value.toLocaleString('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const doc = new jsPDF();

  // Fresh, high-contrast colors
  const primaryColor: [number, number, number] = [29, 78, 216]; // blue-700 - deeper blue for better contrast
  const textDarkColor: [number, number, number] = [31, 41, 55]; // gray-800 - darker for readability
  const textLightColor: [number, number, number] = [75, 85, 99]; // gray-600 - lighter but still readable
  const backgroundColor: [number, number, number] = [249, 250, 251]; // gray-50 - light fresh background

  // Add business logo (if available)
  let yPos = 20;
  if (businessInfo.logo) {
    try {
      doc.addImage(businessInfo.logo, 'PNG', 15, yPos, 30, 30);
      yPos += 35;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Business info (left side)
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(businessInfo.name, 15, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(textLightColor[0], textLightColor[1], textLightColor[2]);
  if (businessInfo.address) {
    doc.text(businessInfo.address, 15, yPos);
    yPos += 5;
  }
  if (businessInfo.phone) {
    doc.text(`Phone: ${businessInfo.phone}`, 15, yPos);
    yPos += 5;
  }
  if (businessInfo.email) {
    doc.text(`Email: ${businessInfo.email}`, 15, yPos);
    yPos += 5;
  }
  if (businessInfo.panNumber) {
    doc.text(`PAN: ${businessInfo.panNumber}`, 15, yPos);
  }

  // Invoice title and number (right side)
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE', 200, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(textLightColor[0], textLightColor[1], textLightColor[2]);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 200, 30, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 200, 36, {
    align: 'right',
  });
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 200, 42, {
    align: 'right',
  });

  // Status badge with improved colors
  doc.setFontSize(12);
  const statusColor: Record<string, [number, number, number]> = {
    PAID: [22, 163, 74], // green-600 - darker, more professional
    PENDING: [234, 179, 8], // yellow-600
    OVERDUE: [220, 38, 38], // red-600 - stronger red
    CANCELLED: [75, 85, 99], // gray-600
  };
  const color = statusColor[invoice.status] || textLightColor;
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(invoice.status, 200, 48, { align: 'right' });

  // Customer info section with fresh background
  yPos = 70;
  doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  doc.rect(15, yPos, 180, 30, 'F');

  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(textDarkColor[0], textDarkColor[1], textDarkColor[2]);
  doc.text('Bill To:', 20, yPos);

  yPos += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.customer.name, 20, yPos);
  doc.setFont('helvetica', 'normal');

  if (invoice.customer.email || invoice.customer.phone) {
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(textLightColor[0], textLightColor[1], textLightColor[2]);
    if (invoice.customer.email) {
      doc.text(invoice.customer.email, 20, yPos);
      yPos += 5;
    }
    if (invoice.customer.phone) {
      doc.text(invoice.customer.phone, 20, yPos);
      yPos += 5;
    }
  }

  if (invoice.customer.panNumber) {
    doc.text(`PAN: ${invoice.customer.panNumber}`, 20, yPos);
  }

  // Items table
  yPos += 15;
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: invoice.items.map((item) => {
      const unitPrice = toNumber(item.unitPrice ?? item.rate, 0);
      const lineTotal = toNumber(item.total ?? item.amount, unitPrice * item.quantity);
      return [
      item.description,
      item.quantity.toString(),
      `रू ${unitPrice.toFixed(2)}`,
      `रू ${lineTotal.toFixed(2)}`,
    ];
    }),
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

  // Totals summary card
  const totalsX = 120;
  const totalsWidth = 75;
  const rows: Array<{ label: string; value: string; color?: [number, number, number] }> = [
    {
      label: 'Subtotal',
      value: formatCurrency(toNumber(invoice.subtotal)),
    },
    {
      label: `VAT (${toNumber(invoice.vatRate)}%)`,
      value: formatCurrency(toNumber(invoice.vatAmount)),
    },
  ];

  if (toNumber(invoice.discountAmount) > 0) {
    rows.push({
      label: 'Discount',
      value: `- ${formatCurrency(toNumber(invoice.discountAmount))}`,
      color: [220, 38, 38],
    });
  }

  const totalValue = formatCurrency(toNumber(invoice.totalAmount ?? invoice.total));
  const cardPadding = 6;
  const rowHeight = 6;
  const cardHeight = cardPadding * 2 + rowHeight * rows.length + 10;
  let totalsY = finalY + 12;

  doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  doc.roundedRect(totalsX, totalsY, totalsWidth, cardHeight, 3, 3, 'F');

  totalsY += cardPadding + 4;
  doc.setFontSize(10);

  rows.forEach((row) => {
    doc.setTextColor(textLightColor[0], textLightColor[1], textLightColor[2]);
    doc.text(`${row.label}:`, totalsX + 4, totalsY);
    const valueColor = row.color ?? textDarkColor;
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    doc.text(row.value, totalsX + totalsWidth - 4, totalsY, { align: 'right' });
    totalsY += rowHeight;
  });

  totalsY += 2;
  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX + 4, totalsY, totalsX + totalsWidth - 4, totalsY);

  totalsY += 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDarkColor[0], textDarkColor[1], textDarkColor[2]);
  doc.text('Total', totalsX + 4, totalsY);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(totalValue, totalsX + totalsWidth - 4, totalsY, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // Notes section (if any)
  if (invoice.notes) {
    totalsY += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textDarkColor[0], textDarkColor[1], textDarkColor[2]);
    doc.text('Notes:', 15, totalsY);

    totalsY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textLightColor[0], textLightColor[1], textLightColor[2]);
    const splitNotes = doc.splitTextToSize(invoice.notes, 180);
    doc.text(splitNotes, 15, totalsY);
  }

  // Footer with softer colors
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(textLightColor[0], textLightColor[1], textLightColor[2]);
  doc.text(
    'Thank you for your business!',
    105,
    pageHeight - 20,
    { align: 'center' }
  );
  doc.setTextColor(156, 163, 175); // gray-400 for timestamp
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    105,
    pageHeight - 15,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};

export const generateExpenseReceiptPDF = (expense: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Expense Receipt', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  let yPos = 40;
  
  doc.text(`Expense ID: ${expense.id}`, 20, yPos);
  yPos += 10;
  doc.text(`Date: ${new Date(expense.date).toLocaleDateString()}`, 20, yPos);
  yPos += 10;
  doc.text(`Category: ${expense.category}`, 20, yPos);
  yPos += 10;
  doc.text(`Amount: रू ${expense.amount.toFixed(2)}`, 20, yPos);
  yPos += 10;
  doc.text(`VAT: रू ${expense.vatAmount.toFixed(2)}`, 20, yPos);
  yPos += 10;
  doc.text(`Total: रू ${expense.totalAmount.toFixed(2)}`, 20, yPos);
  
  if (expense.notes) {
    yPos += 15;
    doc.text('Notes:', 20, yPos);
    yPos += 7;
    const splitNotes = doc.splitTextToSize(expense.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }
  
  doc.save(`Expense-${expense.id}.pdf`);
};
