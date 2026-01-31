import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { MenuList } from "@/components/menu/menu-list";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MenuList />
      </main>
      <Footer />
    </div>
  );
}
