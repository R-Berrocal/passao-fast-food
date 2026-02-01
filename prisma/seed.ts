import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, DayOfWeek } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // ============================================================================
  // CATEGORÍAS
  // ============================================================================
  console.log("📁 Creando categorías...");

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "arepas" },
      update: {},
      create: {
        name: "Arepas",
        slug: "arepas",
        displayOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "perros" },
      update: {},
      create: {
        name: "Perros",
        slug: "perros",
        displayOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "patacones" },
      update: {},
      create: {
        name: "Patacones",
        slug: "patacones",
        displayOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "suizos" },
      update: {},
      create: {
        name: "Suizos",
        slug: "suizos",
        displayOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "desgranados" },
      update: {},
      create: {
        name: "Desgranados",
        slug: "desgranados",
        displayOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "salchipapas" },
      update: {},
      create: {
        name: "Salchipapas",
        slug: "salchipapas",
        displayOrder: 6,
      },
    }),
  ]);

  const categoryMap = Object.fromEntries(categories.map((c: { slug: string; id: string }) => [c.slug, c.id]));

  // ============================================================================
  // PRODUCTOS
  // ============================================================================
  console.log("🍔 Creando productos...");

  const products = [
    // Arepas
    { name: "Arepa Quesuda", price: 6000, category: "arepas", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop" },
    { name: "Arepa Jamón Queso", price: 6500, category: "arepas", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop" },
    { name: "Arepa Buti", price: 7500, category: "arepas", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop" },
    { name: "Arepa Hawaiana", price: 7500, category: "arepas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" },
    { name: "Arepa Chorizo", price: 8000, category: "arepas", image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&h=300&fit=crop" },
    { name: "Arepa Suiza", price: 8000, category: "arepas", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop" },
    { name: "Arepa Chicharrón", price: 8000, category: "arepas", image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop" },
    { name: "Arepa Pollo", price: 8500, category: "arepas", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop" },
    { name: "Arepa Carne", price: 9000, category: "arepas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
    { name: "Arepa Ranchera", price: 9500, category: "arepas", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop" },
    { name: "Arepa Doble", price: 12000, description: "2 carnes a elección", category: "arepas", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop" },
    { name: "Arepa Full", price: 14000, description: "Todas las carnes + maicito", category: "arepas", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },

    // Perros
    { name: "Perro Clásico", price: 5000, category: "perros", image: "https://images.unsplash.com/photo-1612392062631-94e8e4b96041?w=400&h=300&fit=crop" },
    { name: "ChoriPerro", price: 7000, category: "perros", image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400&h=300&fit=crop" },
    { name: "Perro Especial", price: 7500, description: "Chicharrón, gratinado y jamón", category: "perros", image: "https://images.unsplash.com/photo-1496649646107-aa73185a7f3c?w=400&h=300&fit=crop" },
    { name: "Perro Ranchero", price: 8000, description: "Chorizo, gratinado y maicito", category: "perros", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=300&fit=crop" },
    { name: "Perro Suizo", price: 8500, description: "Salchicha suiza, gratinado, maicito y jamón", category: "perros", image: "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=400&h=300&fit=crop" },

    // Patacones
    { name: "Patacón Jamón", price: 9000, category: "patacones", image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop" },
    { name: "Patacón Buti", price: 9500, category: "patacones", image: "https://images.unsplash.com/photo-1585325701165-351af916e581?w=400&h=300&fit=crop" },
    { name: "Patacón Hawaiana", price: 9500, category: "patacones", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop" },
    { name: "Patacón Chorizo", price: 10000, category: "patacones", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop" },
    { name: "Patacón Suiza", price: 10000, category: "patacones", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop" },
    { name: "Patacón Pollo", price: 11000, category: "patacones", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop" },
    { name: "Patacón Carne", price: 11500, category: "patacones", image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop" },
    { name: "Patacón Ranchero", price: 13000, category: "patacones", image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=400&h=300&fit=crop" },
    { name: "Patacón Doble", price: 15000, description: "2 carnes a elección", category: "patacones", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
    { name: "Patacón Full", price: 19000, description: "Todas las carnes + maicito", category: "patacones", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" },

    // Suizos
    { name: "Mini Sencillo", price: 12000, category: "suizos", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop" },
    { name: "Mini Especial", price: 14000, category: "suizos", image: "https://images.unsplash.com/photo-1482049016gy-958d8020a68a?w=400&h=300&fit=crop" },
    { name: "Suizo Especial", price: 16000, description: "Chorizo, butifarra y maicito", category: "suizos", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop" },
    { name: "Suizo Passao", price: 22000, description: "Chorizo, pollo, butifarra, maicito", category: "suizos", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop" },

    // Desgranados
    { name: "Sencillo", price: 15000, description: "Maíz, butifarra, chorizo, jamón", category: "desgranados", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop" },
    { name: "Especial", price: 20000, description: "Maíz, butifarra, chorizo, jamón y pollo", category: "desgranados", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop" },

    // Salchipapas
    { name: "Mini Sencilla", price: 11000, category: "salchipapas", image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop" },
    { name: "Mini Especial", price: 13000, category: "salchipapas", image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&h=300&fit=crop" },
    { name: "Especial", price: 15000, description: "Chorizo, butifarra y maicito", category: "salchipapas", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop" },
    { name: "De la Casa", price: 20000, description: "Chorizo, pollo, butifarra, maicito", category: "salchipapas", image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&h=300&fit=crop" },
  ];

  for (const [index, product] of products.entries()) {
    await prisma.product.upsert({
      where: {
        id: `product-${product.category}-${index}`,
      },
      update: {
        price: product.price,
        description: product.description,
      },
      create: {
        id: `product-${product.category}-${index}`,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        categoryId: categoryMap[product.category],
        displayOrder: index,
      },
    });
  }

  // ============================================================================
  // ADICIONES
  // ============================================================================
  console.log("➕ Creando adiciones...");

  const additions = [
    { name: "Maicito", price: 3500, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop" },
    { name: "Gratinado", price: 4000, image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop" },
    { name: "Butifarra", price: 4500, image: "https://images.unsplash.com/photo-1595777216528-071e0127ccbf?w=400&h=300&fit=crop" },
    { name: "Papa francesa", price: 4500, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop" },
    { name: "Suiza", price: 4500, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop" },
    { name: "Chicharrón", price: 4500, image: "https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=400&h=300&fit=crop" },
    { name: "Carne", price: 5500, image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop" },
    { name: "Pollo", price: 5500, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop" },
  ];

  for (const [index, addition] of additions.entries()) {
    await prisma.addition.upsert({
      where: { id: `addition-${index}` },
      update: { price: addition.price },
      create: {
        id: `addition-${index}`,
        name: addition.name,
        price: addition.price,
        image: addition.image,
        displayOrder: index,
      },
    });
  }

  // ============================================================================
  // HORARIOS DE ATENCIÓN
  // ============================================================================
  console.log("🕐 Configurando horarios...");

  const days: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const hours: Record<DayOfWeek, { isOpen: boolean; openTime?: string; closeTime?: string }> = {
    monday: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
    tuesday: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
    wednesday: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
    thursday: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
    friday: { isOpen: true, openTime: "10:00", closeTime: "23:00" },
    saturday: { isOpen: true, openTime: "11:00", closeTime: "23:00" },
    sunday: { isOpen: true, openTime: "12:00", closeTime: "20:00" },
  };

  for (const day of days) {
    await prisma.businessHours.upsert({
      where: { dayOfWeek: day },
      update: hours[day],
      create: {
        dayOfWeek: day,
        ...hours[day],
      },
    });
  }

  // ============================================================================
  // CONFIGURACIÓN DEL NEGOCIO
  // ============================================================================
  console.log("⚙️ Configurando negocio...");

  await prisma.businessConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "PASSAO",
      phone: "+57 300 123 4567",
      email: "contacto@passao.com",
      address: "Calle 45 #23-12",
      city: "Barranquilla",
      deliveryFee: 5000,
      minOrderAmount: 15000,
      nequiNumber: "3001234567",
      daviplataNumber: "3001234567",
      bankName: "Bancolombia",
      bankAccountNumber: "123-456789-00",
      bankAccountType: "Ahorros",
      bankAccountHolder: "PASSAO SAS",
    },
  });

  // ============================================================================
  // USUARIO ADMIN
  // ============================================================================
  console.log("👤 Creando usuario admin...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@passao.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "teamovalentina14";

  // Verificar si el usuario admin ya existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        phone: "3001234567",
        password: hashedPassword,
        role: "admin",
        status: "active",
      },
    });
    console.log(`✅ Usuario admin creado: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Usuario admin ya existe: ${adminEmail}`);
  }

  console.log("✅ Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
