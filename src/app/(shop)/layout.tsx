import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Marquee } from "@/components/layout/Marquee";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LocaleProvider } from "@/context/LocaleContext";
import PageViewTracker from "@/components/PageViewTracker";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <PageViewTracker />
      <Marquee />
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-16 md:pt-20">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
