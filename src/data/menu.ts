export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  image: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    id: "arepas",
    name: "Arepas",
    items: [
      { id: "arepa-1", name: "Arepa Quesuda", price: 6000, category: "arepas", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop" },
      { id: "arepa-2", name: "Arepa Jamón Queso", price: 6500, category: "arepas", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop" },
      { id: "arepa-3", name: "Arepa Buti", price: 7500, category: "arepas", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop" },
      { id: "arepa-4", name: "Arepa Hawaiana", price: 7500, category: "arepas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" },
      { id: "arepa-5", name: "Arepa Chorizo", price: 8000, category: "arepas", image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&h=300&fit=crop" },
      { id: "arepa-6", name: "Arepa Suiza", price: 8000, category: "arepas", image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop" },
      { id: "arepa-7", name: "Arepa Chicharrón", price: 8000, category: "arepas", image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop" },
      { id: "arepa-8", name: "Arepa Pollo", price: 8500, category: "arepas", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop" },
      { id: "arepa-9", name: "Arepa Carne", price: 9000, category: "arepas", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
      { id: "arepa-10", name: "Arepa Ranchera", price: 9500, category: "arepas", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop" },
      { id: "arepa-11", name: "Arepa Doble", price: 12000, description: "2 carnes a elección", category: "arepas", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop" },
      { id: "arepa-12", name: "Arepa Full", price: 14000, description: "Todas las carnes + maicito", category: "arepas", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "perros",
    name: "Perros",
    items: [
      { id: "perro-1", name: "Perro Clásico", price: 5000, category: "perros", image: "https://images.unsplash.com/photo-1612392062631-94e8e4b96041?w=400&h=300&fit=crop" },
      { id: "perro-2", name: "ChoriPerro", price: 7000, category: "perros", image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400&h=300&fit=crop" },
      { id: "perro-3", name: "Perro Especial", price: 7500, description: "Chicharrón, gratinado y jamón", category: "perros", image: "https://images.unsplash.com/photo-1496649646107-aa73185a7f3c?w=400&h=300&fit=crop" },
      { id: "perro-4", name: "Perro Ranchero", price: 8000, description: "Chorizo, gratinado y maicito", category: "perros", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=300&fit=crop" },
      { id: "perro-5", name: "Perro Suizo", price: 8500, description: "Salchicha suiza, gratinado, maicito y jamón", category: "perros", image: "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "patacones",
    name: "Patacones",
    items: [
      { id: "patacon-1", name: "Patacón Jamón", price: 9000, category: "patacones", image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop" },
      { id: "patacon-2", name: "Patacón Buti", price: 9500, category: "patacones", image: "https://images.unsplash.com/photo-1585325701165-351af916e581?w=400&h=300&fit=crop" },
      { id: "patacon-3", name: "Patacón Hawaiana", price: 9500, category: "patacones", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop" },
      { id: "patacon-4", name: "Patacón Chorizo", price: 10000, category: "patacones", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop" },
      { id: "patacon-5", name: "Patacón Suiza", price: 10000, category: "patacones", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop" },
      { id: "patacon-6", name: "Patacón Pollo", price: 11000, category: "patacones", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop" },
      { id: "patacon-7", name: "Patacón Carne", price: 11500, category: "patacones", image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop" },
      { id: "patacon-8", name: "Patacón Ranchero", price: 13000, category: "patacones", image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=400&h=300&fit=crop" },
      { id: "patacon-9", name: "Patacón Doble", price: 15000, description: "2 carnes a elección", category: "patacones", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { id: "patacon-10", name: "Patacón Full", price: 19000, description: "Todas las carnes + maicito", category: "patacones", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "suizos",
    name: "Suizos",
    items: [
      { id: "suizo-1", name: "Mini Sencillo", price: 12000, category: "suizos", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop" },
      { id: "suizo-2", name: "Mini Especial", price: 14000, category: "suizos", image: "https://images.unsplash.com/photo-1482049016gy-958d8020a68a?w=400&h=300&fit=crop" },
      { id: "suizo-3", name: "Suizo Especial", price: 16000, description: "Chorizo, butifarra y maicito", category: "suizos", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop" },
      { id: "suizo-4", name: "Suizo Passao", price: 22000, description: "Chorizo, pollo, butifarra, maicito", category: "suizos", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "desgranados",
    name: "Desgranados",
    items: [
      { id: "desgranado-1", name: "Sencillo", price: 15000, description: "Maíz, butifarra, chorizo, jamón", category: "desgranados", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop" },
      { id: "desgranado-2", name: "Especial", price: 20000, description: "Maíz, butifarra, chorizo, jamón y pollo", category: "desgranados", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop" },
    ],
  },
  {
    id: "salchipapas",
    name: "Salchipapas",
    items: [
      { id: "salchipapa-1", name: "Mini Sencilla", price: 11000, category: "salchipapas", image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop" },
      { id: "salchipapa-2", name: "Mini Especial", price: 13000, category: "salchipapas", image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&h=300&fit=crop" },
      { id: "salchipapa-3", name: "Especial", price: 15000, description: "Chorizo, butifarra y maicito", category: "salchipapas", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop" },
      { id: "salchipapa-4", name: "De la Casa", price: 20000, description: "Chorizo, pollo, butifarra, maicito", category: "salchipapas", image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&h=300&fit=crop" },
    ],
  },
];

export const adiciones: MenuItem[] = [
  { id: "adicion-1", name: "Maicito", price: 3500, category: "adiciones", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop" },
  { id: "adicion-2", name: "Gratinado", price: 4000, category: "adiciones", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop" },
  { id: "adicion-3", name: "Butifarra", price: 4500, category: "adiciones", image: "https://images.unsplash.com/photo-1595777216528-071e0127ccbf?w=400&h=300&fit=crop" },
  { id: "adicion-4", name: "Papa francesa", price: 4500, category: "adiciones", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop" },
  { id: "adicion-5", name: "Suiza", price: 4500, category: "adiciones", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop" },
  { id: "adicion-6", name: "Chicharrón", price: 4500, category: "adiciones", image: "https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=400&h=300&fit=crop" },
  { id: "adicion-7", name: "Carne", price: 5500, category: "adiciones", image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop" },
  { id: "adicion-8", name: "Pollo", price: 5500, category: "adiciones", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop" },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
