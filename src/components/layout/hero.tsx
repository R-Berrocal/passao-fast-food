"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useBusinessConfig } from "@/hooks/use-business";

export function Hero() {
  const { config } = useBusinessConfig();

  const name = config?.name || "PASSAO";
  const slogan = config?.slogan || "Las mejores arepas, perros y patacones de la ciudad.";
  const logoUrl = config?.logoUrl;
  const heroStatArepas = config?.heroStatArepas ?? 12;
  const heroStatPerros = config?.heroStatPerros ?? 5;
  const heroStatPatacones = config?.heroStatPatacones ?? 10;
  const heroStatTotal = config?.heroStatTotal ?? 30;

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/local-1.png"
          alt={`Interior del local ${name}`}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-2xl md:h-32 md:w-32 overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`Logo ${name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-primary-foreground md:text-5xl">
                {name.charAt(0)}
              </span>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            <span className="text-primary drop-shadow-lg">{name}</span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-gray-200 md:text-xl">
            {slogan}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="min-w-40 text-base" asChild>
              <Link href="#menu">Ver Menú</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-40 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 text-base"
              asChild
            >
              <Link href="/checkout">Ordenar Ahora</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-12">
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">{heroStatArepas}+</p>
              <p className="text-sm text-gray-300">Tipos de Arepas</p>
            </div>
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">{heroStatPerros}+</p>
              <p className="text-sm text-gray-300">Perros Calientes</p>
            </div>
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">{heroStatPatacones}+</p>
              <p className="text-sm text-gray-300">Patacones</p>
            </div>
            <div className="rounded-lg bg-black/30 px-6 py-4 backdrop-blur-sm">
              <p className="text-3xl font-bold text-primary md:text-4xl">{heroStatTotal}+</p>
              <p className="text-sm text-gray-300">Productos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
