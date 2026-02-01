"use client";

import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { useBusinessConfig } from "@/hooks/use-business";

export function Footer() {
  const { config } = useBusinessConfig();

  const name = config?.name || "PASSAO";
  const slogan = config?.slogan || "Las mejores arepas, perros y patacones de la ciudad.";
  const phone = config?.phone || "";
  const city = config?.city || "Barranquilla";
  const address = config?.address || "";
  const logoUrl = config?.logoUrl;
  const instagramUrl = config?.instagramUrl;
  const facebookUrl = config?.facebookUrl;

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`Logo ${name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-primary-foreground">
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-primary">{name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {slogan}
            </p>
            {(instagramUrl || facebookUrl) && (
              <div className="flex gap-3 mt-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Menú</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#arepas" className="hover:text-primary">Arepas</Link></li>
              <li><Link href="#perros" className="hover:text-primary">Perros</Link></li>
              <li><Link href="#patacones" className="hover:text-primary">Patacones</Link></li>
              <li><Link href="#suizos" className="hover:text-primary">Suizos</Link></li>
              <li><Link href="#salchipapas" className="hover:text-primary">Salchipapas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {phone && <li>Domicilios: {phone}</li>}
              {address && <li>{address}</li>}
              <li>{city}, Colombia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
