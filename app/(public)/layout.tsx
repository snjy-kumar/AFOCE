import CTA from "@/components/public/CTA";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <main className="pt-28">{children}</main>
      <CTA />
      <Footer />
    </div>
  );
}
