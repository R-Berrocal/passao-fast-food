import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/local-1.png"
          alt="Interior del local Passao"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-2xl md:h-32 md:w-32">
            <span className="text-4xl font-bold text-primary-foreground md:text-5xl">P</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            <span className="text-primary drop-shadow-lg">PASSAO</span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-gray-200 md:text-xl">
            Las mejores arepas, perros, patacones y más de la ciudad.
            <br className="hidden sm:block" />
            Sabor colombiano en cada bocado.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="min-w-[160px] text-base" asChild>
              <Link href="#menu">Ver Menú</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[160px] border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 text-base"
              asChild
            >
              <Link href="/checkout">Ordenar Ahora</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-12">
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">12+</p>
              <p className="text-sm text-gray-300">Tipos de Arepas</p>
            </div>
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">5+</p>
              <p className="text-sm text-gray-300">Perros Calientes</p>
            </div>
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">10+</p>
              <p className="text-sm text-gray-300">Patacones</p>
            </div>
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">30+</p>
              <p className="text-sm text-gray-300">Productos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
