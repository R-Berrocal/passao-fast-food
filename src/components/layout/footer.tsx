import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold text-primary">PASSAO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Las mejores arepas, perros y patacones de la ciudad.
              Calidad y sabor en cada pedido.
            </p>
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
              <li>Domicilios: 324 793 0108</li>
              <li>Barranquilla, Colombia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Passao. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
