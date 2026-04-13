import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AFOCE",
    template: "%s | AFOCE",
  },
  description:
    "Adaptive Financial Operations & Compliance Engine for Nepali businesses. Premium operations design with local compliance logic, BS date handling, and workflow automation.",
  keywords: [
    "AFOCE",
    "Nepal accounting software",
    "IRD compliance",
    "Bikram Sambat",
    "VAT software Nepal",
    "finance operations platform",
  ],
  openGraph: {
    title: "AFOCE",
    description:
      "A premium financial operations platform for Nepali SMEs with workflow intelligence and local compliance built in.",
    siteName: "AFOCE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AFOCE",
    description:
      "Premium finance operations for Nepali SMEs with built-in workflow intelligence and compliance logic.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
